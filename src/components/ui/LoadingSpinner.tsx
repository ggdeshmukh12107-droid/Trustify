
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

const sizeMap = {
    sm: 16,
    md: 28,
    lg: 44,
};

export function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
    const px = sizeMap[size];
    return (
        <div className="loading-spinner-wrap" role="status" aria-label={label || 'Loading'}>
            <svg
                className="loading-spinner"
                width={px}
                height={px}
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="22"
                    cy="22"
                    r="18"
                    stroke="rgba(99,102,241,0.2)"
                    strokeWidth="4"
                />
                <path
                    d="M22 4 A18 18 0 0 1 40 22"
                    stroke="url(#spinner-grad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="spinner-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
            </svg>
            {label && <span className="loading-label">{label}</span>}
        </div>
    );
}

export default LoadingSpinner;
