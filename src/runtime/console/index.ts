const ErrorImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj4KPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIHN0cm9rZT0icmVkIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiLz4KPGxpbmUgeDE9IjMwIiB5MT0iMzAiIHgyPSI3MCIgeTI9IjcwIiBzdHJva2U9InJlZCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxsaW5lIHgxPSI3MCIgeTE9IjMwIiB4Mj0iMzAiIHkyPSI3MCIgc3Ryb2tlPSJyZWQiIHN0cm9rZS13aWR0aD0iNCIvPgo8L3N2Zz4K";
const WarningImage = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI4My44NzQzMSIgaGVpZ2h0PSI4My4zNDQ0NSIgdmlld0JveD0iMCwwLDgzLjg3NDMxLDgzLjM0NDQ1Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTk4LjA2Mjg1LC0xMzcuMTAzKSI+PGcgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9IiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI2ZmZmYwMCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6IG5vcm1hbCI+PHBhdGggZD0iTTIwMS4zMDgxMiwyMTguNDQ3NDVsMzguNjkxODgsLTc2Ljg5NDlsMzguNjkxODgsNzYuODk0OXoiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMjQwLDE2NS40OTM1NnYyOS4wMTI4NyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSI2LjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMzYuNTQwMTcsMjA1LjU3OTQ0YzAsLTEuODIwODQgMS40NzYwOCwtMy4yOTY5MiAzLjI5NjkyLC0zLjI5NjkyYzEuODIwODQsMCAzLjI5NjkyLDEuNDc2MDggMy4yOTY5MiwzLjI5NjkyYzAsMS44MjA4NCAtMS40NzYwOCwzLjI5NjkyIC0zLjI5NjkyLDMuMjk2OTJjLTEuODIwODQsMCAtMy4yOTY5MiwtMS40NzYwOCAtMy4yOTY5MiwtMy4yOTY5MnoiIGZpbGw9IiNmZmZmMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48L2c+PC9nPjwvc3ZnPjwhLS1yb3RhdGlvbkNlbnRlcjo0MS45MzcxNTQxNTY4MjkxMTo0Mi44OTcwMDE0NDk3NjIyLS0+";
const InfoImage = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI4NCIgaGVpZ2h0PSI4NCIgdmlld0JveD0iMCwwLDg0LDg0Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTk4LC0xMzgpIj48ZyBkYXRhLXBhcGVyLWRhdGE9InsmcXVvdDtpc1BhaW50aW5nTGF5ZXImcXVvdDs6dHJ1ZX0iIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSIjMDAwMGZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLWRhc2hhcnJheT0iIiBzdHJva2UtZGFzaG9mZnNldD0iMCIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0yMDAsMTgwYzAsLTIyLjA5MTM5IDE3LjkwODYxLC00MCA0MCwtNDBjMjIuMDkxMzksMCA0MCwxNy45MDg2MSA0MCw0MGMwLDIyLjA5MTM5IC0xNy45MDg2MSw0MCAtNDAsNDBjLTIyLjA5MTM5LDAgLTQwLC0xNy45MDg2MSAtNDAsLTQweiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMjMxLjc0Njk3LDE1OS4wNTY5MmMwLDAgMTQuMDU5NzYsLTMuODE1NzggMTYuMjY0NzksMi4xOTc5NGMyLjIwNTAzLDYuMDEzNzMgLTExLjQyOTMxLDEwLjk4OTcyIC0xMS40MjkzMSwxMC45ODk3MmwwLjg3OTE4LDE3LjU4MzU2IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMjM2LjU0MDE3LDIwMi4wNjI3M2MwLC0xLjgyMDg0IDEuNDc2MDgsLTMuMjk2OTIgMy4yOTY5MiwtMy4yOTY5MmMxLjgyMDg0LDAgMy4yOTY5MiwxLjQ3NjA4IDMuMjk2OTIsMy4yOTY5MmMwLDEuODIwODQgLTEuNDc2MDgsMy4yOTY5MiAtMy4yOTY5MiwzLjI5NjkyYy0xLjgyMDg0LDAgLTMuMjk2OTIsLTEuNDc2MDggLTMuMjk2OTIsLTMuMjk2OTJ6IiBmaWxsPSIjMDAwMGZmIiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjQyLjAwMDAwMDAwMDAwMDAzOjQyLS0+";

export default class Console {
  private consoleElement: HTMLDivElement;
  private titleElement: HTMLDivElement;
  private logElement: HTMLDivElement;
  private closeButton: HTMLImageElement
  private isDragging: boolean;
  private initialMousePos: { x: number; y: number };
  private initialConsolePos: { x: number; y: number };

  constructor() {
    this.consoleElement = document.createElement("div");
    this.titleElement = document.createElement("div");
    this.logElement = document.createElement("div");
    this.closeButton = document.createElement("img");
    this.isDragging = false;
    this.initialMousePos = { x: 0, y: 0 };
    this.initialConsolePos = { x: 0, y: 0 };

    this.initConsole();
    document.body.appendChild(this.consoleElement);
  }

  initConsole() {
    this.consoleElement.classList.add("console");
    this.consoleElement.style.backgroundColor = "#2c3e50";
    this.consoleElement.style.color = "#fff";
    this.consoleElement.style.borderRadius = "10px";
    this.consoleElement.style.padding = "1vw"; // 20px
    this.consoleElement.style.position = "fixed";
    this.consoleElement.style.zIndex = "9999";
    this.consoleElement.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.5)";
    this.consoleElement.style.width = "40vw";
    this.consoleElement.style.height = "40vh";
    this.consoleElement.style.display = "flex";
    this.consoleElement.style.flexDirection = "column";
    this.consoleElement.style.userSelect = "none";

    this.titleElement.classList.add("console-title");
    this.titleElement.textContent = "PenguinScript Console";
    this.titleElement.style.cursor = "move";
    this.titleElement.style.marginBottom = "10px";
    this.titleElement.style.fontWeight = "bold";
    this.titleElement.style.backgroundColor = "#7c8ea0"
    this.consoleElement.appendChild(this.titleElement);

    this.logElement.classList.add("console-log");
    this.logElement.style.flex = "1";
    this.logElement.style.overflow = "auto";
    this.logElement.style.backgroundColor = "#7c8ea0"
    this.consoleElement.appendChild(this.logElement);

    this.consoleElement.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.consoleElement.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.consoleElement.addEventListener("mousemove", this.handleMouseMove.bind(this));

    this.closeButton.src = ErrorImage;
    this.closeButton.style.width = "1.5em";
    this.closeButton.style.height = "1.5em";
    this.closeButton.style.position = "absolute";
    this.closeButton.style.top = "10px";
    this.closeButton.style.right = "10px";
    this.closeButton.style.cursor = "pointer";
    this.closeButton.addEventListener("mousedown", this.hide.bind(this));
    this.consoleElement.appendChild(this.closeButton);
  }

  hide() {
    this.consoleElement.style.display = "none";
  }

  show() {
    this.consoleElement.style.display = "flex";
  }

  escapeMsg(msg: string) {
    return msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/[\n\r]/g, "<br/>").replace(/ /g, "&nbsp;")
  }

  log(message: string) {
    message = escapeMsg(message);
    const logEntry = document.createElement("div");
    logEntry.textContent = `${message}`;
    this.logElement.appendChild(logEntry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  warn(message: string) {
    message = escapeMsg(message);
    const logEntry = document.createElement("p");
    const img = document.createElement("img");
    img.src = WarningImage;
    img.style.width = "1em"; // cuz text is 1em im pretty sure
    img.style.height = "1em";
    logEntry.appendChild(img);
    const text = document.createTextNode(`${message}`);
    logEntry.appendChild(text);
    logEntry.style.color = "#f1c40f";
    this.logElement.appendChild(logEntry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  error(message: string) {
    message = escapeMsg(message);
    const logEntry = document.createElement("p");
    const img = document.createElement("img");
    img.src = ErrorImage;
    img.style.width = "1em"; // cuz text is 1em im pretty sure
    img.style.height = "1em";
    logEntry.appendChild(img);
    const text = document.createTextNode(`${message}`);
    logEntry.appendChild(text);
    logEntry.style.color = "#e74c3c";
    this.logElement.appendChild(logEntry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  handleMouseDown(event: MouseEvent) {
    if (event.target === this.titleElement) {
      this.isDragging = true;
      this.initialMousePos = { x: event.clientX, y: event.clientY };
      this.initialConsolePos = { x: this.consoleElement.offsetLeft, y: this.consoleElement.offsetTop };
    }
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const deltaMove = {
        x: event.clientX - this.initialMousePos.x,
        y: event.clientY - this.initialMousePos.y,
      };

      // Ensure the console stays within the viewport
      const newLeft = Math.max(0, this.initialConsolePos.x + deltaMove.x);
      const newTop = Math.max(0, this.initialConsolePos.y + deltaMove.y);
      const maxLeft = window.innerWidth - this.consoleElement.offsetWidth;
      const maxTop = window.innerHeight - this.consoleElement.offsetHeight;

      this.consoleElement.style.left = `${Math.min(newLeft, maxLeft)}px`;
      this.consoleElement.style.top = `${Math.min(newTop, maxTop)}px`;
    }
  }
}
