/**
 * "Filled/Cross Circle" — a solid disc with an X-shaped cutout, used on the
 * delete button that appears on a selected canvas cable. Not in the design
 * system (its 24/Stroked CrossCircle is a single-color outline+X, not this),
 * so hand-rolled like the other icons in this folder.
 */
export default function CableDeleteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0ZM13.5352 6.46484C13.1446 6.07438 12.5116 6.07434 12.1211 6.46484L10 8.58594L7.87891 6.46484C7.48838 6.07432 6.85537 6.07432 6.46484 6.46484C6.07432 6.85537 6.07432 7.48838 6.46484 7.87891L8.58594 10L6.46484 12.1211C6.07434 12.5116 6.07438 13.1446 6.46484 13.5352C6.85537 13.9257 7.48838 13.9257 7.87891 13.5352L10 11.4141L12.1211 13.5352C12.5116 13.9257 13.1446 13.9257 13.5352 13.5352C13.9257 13.1446 13.9257 12.5116 13.5352 12.1211L11.4141 10L13.5352 7.87891C13.9257 7.48838 13.9257 6.85537 13.5352 6.46484Z"
        fill="currentColor"
      />
    </svg>
  );
}
