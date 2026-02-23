import React from "react";

export default function PlusButton({ className, onClick, title, ariaLabel, disabled = false }) {
    return (
        <button
            className={className}
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            title={title}
            disabled={disabled}
        >
            +
        </button>
    );
}