"""Payment routes - credits, Stripe checkout"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional

from database import get_db
from auth import get_current_user
from config import STRIPE_API_KEY, TIER_PRICING, TIER_FEATURES, CREDIT_PACKAGES, FEATURE_CREDIT_COSTS


router = APIRouter()

# ============== CREDIT SYSTEM ==============

@router.get("/api/credits/packages")
async def get_credit_packages():
    """Get available credit packages for purchase"""
    return {"packages": CREDIT_PACKAGES, "feature_costs": FEATURE_CREDIT_COSTS}


@router.get("/api/credits/balance")
async def get_credit_balance(current_user: dict = Depends(get_current_user)):
    """Get user's credit balance and usage"""
    db = get_db()
    user = await db.users.find_one({"_id": current_user["user_id"]}, {"purchased_credits": 1, "ai_credits_used": 1, "tier": 1})
    user_tier = user.get("tier", "free") if user else "free"
    tier_limits = TIER_FEATURES.get(user_tier, TIER_FEATURES["free"])

    return {
        "purchased_credits": user.get("purchased_credits", 0) if user else 0,
        "tier_credits_used": user.get("ai_credits_used", 0) if user else 0,
        "tier_credits_total": tier_limits["ai_credits"],
        "tier": user_tier
    }


class CreditPurchaseRequest(BaseModel):
    package_id: str
    origin_url: str

class CheckoutRequest(BaseModel):
    tier: str
    billing_cycle: str = "monthly"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


@router.post("/api/credits/purchase")
async def purchase_credits(request: CreditPurchaseRequest, http_request: Request, current_user: dict = Depends(get_current_user)):
    """Create Stripe checkout session for credit purchase"""
    db = get_db()
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    package = next((p for p in CREDIT_PACKAGES if p["id"] == request.package_id), None)
    if not package:
        raise HTTPException(status_code=400, detail="Invalid credit package")

    success_url = f"{request.origin_url}/credits-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.origin_url}/pricing"

    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    checkout_request = CheckoutSessionRequest(
        amount=package["price"],
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user["user_id"],
            "type": "credit_purchase",
            "package_id": package["id"],
            "credits": str(package["credits"])
        }
    )

    session = await stripe_checkout.create_checkout_session(checkout_request)

    await db.payment_transactions.insert_one({
        "_id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": current_user["user_id"],
        "type": "credit_purchase",
        "package_id": package["id"],
        "credits": package["credits"],
        "amount": package["price"],
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"url": session.url, "session_id": session.session_id}


@router.get("/api/credits/verify/{session_id}")
async def verify_credit_purchase(session_id: str, http_request: Request, current_user: dict = Depends(get_current_user)):
    """Verify credit purchase and add credits to user account"""
    db = get_db()
    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    transaction = await db.payment_transactions.find_one({"session_id": session_id, "type": "credit_purchase"})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.get("payment_status") == "paid":
        return {"status": "complete", "credits_added": transaction.get("credits", 0)}

    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    status = await stripe_checkout.get_checkout_status(session_id)

    if status.payment_status == "paid":
        credits_to_add = transaction.get("credits", 0)
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        await db.users.update_one(
            {"_id": current_user["user_id"]},
            {"$inc": {"purchased_credits": credits_to_add}}
        )
        return {"status": "complete", "credits_added": credits_to_add}

    return {"status": status.status, "payment_status": status.payment_status}


# ============== GOOGLE OAUTH ENDPOINTS ==============

@router.post("/api/stripe/create-checkout")
async def create_checkout_session(request: CheckoutRequest, http_request: Request, current_user: dict = Depends(get_current_user)):
    """Create Stripe checkout session"""
    db = get_db()
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Get pricing from server-side configuration (NEVER accept amount from frontend)
    tier_pricing = TIER_PRICING.get(request.tier)
    if not tier_pricing:
        raise HTTPException(status_code=400, detail="Invalid tier")
    
    amount = tier_pricing.get(request.billing_period)
    if not amount:
        raise HTTPException(status_code=400, detail="Invalid billing period")
    
    tier_name = tier_pricing.get("name", request.tier.title())
    
    success_url = f"{request.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.origin_url}/pricing"
    
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Use amount-based checkout instead of price_id
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user["user_id"],
            "tier": request.tier,
            "tier_name": tier_name,
            "billing_period": request.billing_period
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    await db.payment_transactions.insert_one({
        "_id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": current_user["user_id"],
        "tier": request.tier,
        "tier_name": tier_name,
        "billing_period": request.billing_period,
        "amount": amount,
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@router.get("/api/stripe/checkout-status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request, current_user: dict = Depends(get_current_user)):
    """Get checkout status"""
    db = get_db()
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if transaction and transaction.get("payment_status") == "paid":
        return {"status": "complete", "payment_status": "paid", "tier": transaction.get("tier")}
    
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    if status.payment_status == "paid" and transaction:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        await db.users.update_one(
            {"_id": current_user["user_id"]},
            {"$set": {"tier": transaction.get("tier"), "subscription_status": "active"}}
        )
    
    return {"status": status.status, "payment_status": status.payment_status}


# ============== LEGAL KNOWLEDGE BASE API ==============


