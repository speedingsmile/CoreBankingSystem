import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    actions?: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, actions }) => {
    return (
        <div className={`glass-card rounded-3xl p-6 ${className}`}>
            {(title || actions) && (
                <div className="flex justify-between items-center mb-6">
                    {title && <h3 className="text-xl font-semibold text-gray-900">{title}</h3>}
                    {actions && <div className="flex gap-2">{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default GlassCard;
