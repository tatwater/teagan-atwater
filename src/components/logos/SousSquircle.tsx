export default function SousSquircle() {
  return (
    <svg
      fill='none'
      height='512'
      viewBox='0 0 512 512'
      width='512'
      xmlns='http://www.w3.org/2000/svg'
    >
      <mask
        height='512'
        id='squircle'
        maskUnits='userSpaceOnUse'
        style={{ maskType: 'alpha' }}
        width='512'
        x='0'
        y='0'
      >
        <path d='M256 512C368.178 512 430.539 512 471.27 471.27C512 430.539 512 368.178 512 256C512 143.822 512 81.4611 471.27 40.7305C430.539 -6.78168e-06 368.178 0 256 0C143.822 0 81.4611 -6.78168e-06 40.7305 40.7305C-6.78168e-06 81.4611 0 143.822 0 256C0 368.178 -6.78168e-06 430.539 40.7305 471.27C81.4611 512 143.822 512 256 512Z' fill='black' />
      </mask>
      <g mask='url(#squircle)'>
        <rect width='512' height='512' fill='rgb(242, 59, 46)' />
      </g>
      <path d='M244.652 99.7564C250.229 132.972 255.167 147.083 270.2 172.768C280.281 189.994 281.749 192.257 299.325 217.706C332.106 265.17 351.864 294.993 349.861 329.469C349.216 377.009 293.678 429.967 218.803 415.605C176.636 407.517 153.024 351.764 178.575 320.622C187.196 310.115 189.886 311.076 191.019 325.067C195.534 380.786 244.372 407.607 264.563 365.457C273.459 346.888 270.579 338.782 237.991 290.633C198.894 232.867 194.124 219.63 203.23 194.167C210.55 173.699 212.186 168.119 216.448 149.09C218.979 137.796 222.263 121.231 223.746 112.278L226.443 96H235.231H244.021L244.652 99.7564Z' fill='white' />
    </svg>
  )
}
