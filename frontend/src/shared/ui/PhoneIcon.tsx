type PhoneIconProps = {
  size?: number;
  className?: string;
};

export function PhoneIcon({
  size = 24,
  className = "",
}: PhoneIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Круг почти доходит до краёв SVG */}
      <circle cx="256" cy="256" r="256" fill="currentColor" />

      {/* Белая телефонная трубка */}
      <path
        d="M153 165
           C153 158 158 155 165 154
           L203 146
           C210 144 215 147 219 154
           L233 205
           C235 211 233 216 228 221
           L206 237
           C222 269 246 293 278 308
           L294 286
           C299 280 304 278 310 281
           L350 298
           C357 301 360 306 358 313
           L349 351
           C347 358 342 361 335 360
           C235 355 158 278 153 178
           Z"
        fill="white"
      />
    </svg>
  );
}