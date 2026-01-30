import React, { useState } from "react";
import { Calendar, FileDown, FileJson, FileText, SortAsc } from "lucide-react";
import jsPDF from "jspdf";

export default function TimelineBuilder() {
  const [events, setEvents] = useState([
    { id: 1, date: "", title: "", notes: "" }
  ]);

  const addEvent = () => {
    setEvents([
      ...events,
      { id: Date.now(), date: "", title: "", notes: "" }
    ]);
  };

  const updateEvent = (id, field, value) => {
    setEvents(events.map(ev => 
      ev.id === id ? { ...ev, [field]: value } : ev
    ));
  };

  const removeEvent = (id) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const sortByDate = () => {
    const sorted = [...events].sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });
    setEvents(sorted);
  };

  const downloadJSON = () => {
    const data = JSON.stringify(events, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("CPS Case Timeline", 10, 15);

    pdf.setFontSize(12);
    let y = 30;

    events.forEach((ev, index) => {
      pdf.text(`${index + 1}. ${ev.date || "No date"} — ${ev.title}`, 10, y);
      y += 7;

      const lines = pdf.splitTextToSize(ev.notes, 180);
      pdf.text(lines, 10, y);
      y += lines.length * 7 + 5;

      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    pdf.save("timeline.pdf");
  };

  const generateNarrative = () => {
    let narrative = "COURT-READY TIMELINE NARRATIVE\n\n";

    events.forEach((ev) => {
      narrative += `On ${ev.date || "an unknown date"}, ${ev.title}. `;
      if (ev.notes) narrative += `${ev.notes}\n\n`;
    });

    const blob = new Blob([narrative], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline_narrative.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Calendar size={24} />
        CPS Case Timeline Builder
      </h1>

      <div className="flex gap-4 flex-wrap">
        <button
          onClick={sortByDate}
          className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800"
        >
          <SortAsc size={18} /> Sort by Date
        </button>

        <button
          onClick={downloadJSON}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
        >
          <FileJson size={18} /> Download JSON
        </button>

        <button
          onClick={generatePDF}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FileDown size={18} /> Generate PDF
        </button>

        <button
          onClick={generateNarrative}
          className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700"
        >
          <FileText size={18} /> Court Narrative
        </button>
      </div>

      <div className="space-y-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="border rounded-lg p-4 bg-white shadow-sm space-y-3"
          >
            <div className="flex gap-4">
              <input
                type="date"
                className="border p-2 rounded w-40"
                value={ev.date}
                onChange={(e) => updateEvent(ev.id, "date", e.target.value)}
              />

              <input
                type="text"
                placeholder="Event title"
                className="border p-2 rounded flex-1"
                value={ev.title}
                onChange={(e) => updateEvent(ev.id, "title", e.target.value)}
              />
            </div>

            <textarea
              placeholder="Notes, details, who was present, what happened..."
              className="border p-2 rounded w-full h-24"
              value={ev.notes}
              onChange={(e) => updateEvent(ev.id, "notes", e.target.value)}
            />

            <button
              onClick={() => removeEvent(ev.id)}
              className="text-red-600 hover:underline text-sm"
            >
              Remove event
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addEvent}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Event
      </button>
    </div>
  );
}
