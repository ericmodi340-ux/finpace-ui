// ----------------------------------------------------------------------

export default function simulateMouseClick(element: Element | null) {
  if (!element) {
    return;
  }

  const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
  mouseClickEvents.forEach((mouseEventType) =>
    element.dispatchEvent(
      new MouseEvent(mouseEventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1,
      })
    )
  );
}
