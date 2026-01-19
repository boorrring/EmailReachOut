import React from "react";
import "../styles/compose.css";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Compose New Email</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <label>
            Subject
            <input type="text" placeholder="Enter subject" />
          </label>

          <label>
            Body
            <textarea placeholder="Write your email..." rows={5} />
          </label>

          <label>
            Upload email list (CSV / TXT)
            <input type="file" />
            <small>0 emails detected</small>
          </label>

          <div className="row">
            <label>
              Start Time
              <input type="datetime-local" />
            </label>

            <label>
              Delay (minutes)
              <input type="number" placeholder="e.g. 5" />
            </label>

            <label>
              Hourly Limit
              <input type="number" placeholder="e.g. 10" />
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary">Schedule</button>
        </div>
      </div>
    </div>
  );
};

export default ComposeModal;
