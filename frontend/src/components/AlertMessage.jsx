import React from "react";

const AlertMessage = ({ type, message }) => {
    const styles = {
        error: 'bg-red-100 border-red-400 text-red-700',
        success: 'bg-green-100 border-green-400 text-green-700',
        info: 'bg-blue-100 border-blue-400 text-blue-700',
    };

    if (! message) return null;

    return (
        <div className={`${styles[type]} border px-4 py-3 rounded mb-4`}>
            {message}
        </div>
    );
};

export default AlertMessage;
