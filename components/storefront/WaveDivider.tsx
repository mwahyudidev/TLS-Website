export function WaveDivider({
  flip = false,
  topColor = "white",
  bottomColor = "white",
  className = "",
}: {
  flip?: boolean;
  topColor?: string;
  bottomColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden leading-none ${className}`}
      style={{ transform: flip ? "scaleY(-1)" : undefined, backgroundColor: topColor }}
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full"
        style={{ height: 70, display: "block" }}
      >
        {/* Back wave — slower drift */}
        <path
          fill={bottomColor}
          fillOpacity="0.4"
          d="M0,45 C240,10 480,70 720,40 C960,10 1200,60 1440,35 L1440,70 L0,70 Z"
          className="animate-wave-drift"
          style={{ animationDuration: "10s" }}
        />
        {/* Front wave */}
        <path
          fill={bottomColor}
          d="M0,35 C300,70 600,5 900,40 C1100,65 1280,20 1440,45 L1440,70 L0,70 Z"
          className="animate-wave-drift"
          style={{ animationDuration: "7s", animationDelay: "-3s" }}
        />
      </svg>
    </div>
  );
}
