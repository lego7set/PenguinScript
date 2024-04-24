export default class Console {
  private consoleElement: HTMLDivElement;
  private titleElement: HTMLDivElement;
  private logElement: HTMLDivElement;
  private isDragging: boolean;
  private initialMousePos: { x: number; y: number };
  private initialConsolePos: { x: number; y: number };

  constructor() {
    this.consoleElement = document.createElement("div");
    this.titleElement = document.createElement("div");
    this.logElement = document.createElement("div");
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
    this.consoleElement.style.width = "30vw";
    this.consoleElement.style.height = "40vh";
    this.consoleElement.style.display = "flex";
    this.consoleElement.style.flexDirection = "column";
    this.consoleElement.style.userSelect = "none";

    this.titleElement.classList.add("console-title");
    this.titleElement.textContent = "PenguinScript Console";
    this.titleElement.style.cursor = "move";
    this.titleElement.style.marginBottom = "10px";
    this.titleElement.style.fontWeight = "bold";
    this.consoleElement.appendChild(this.titleElement);

    this.logElement.classList.add("console-log");
    this.logElement.style.flex = "1";
    this.logElement.style.overflow = "auto";
    this.consoleElement.appendChild(this.logElement);

    this.consoleElement.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.consoleElement.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.consoleElement.addEventListener("mousemove", this.handleMouseMove.bind(this));
  }

  log(message: string) {
    const logEntry = document.createElement("div");
    logEntry.textContent = message;
    this.logElement.appendChild(logEntry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  warn(message: string) {
    const logEntry = document.createElement("div");
    logEntry.textContent = `Warning: ${message}`;
    logEntry.style.color = "#f1c40f";
    this.logElement.appendChild(logEntry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  error(message: string) {
    const logEntry = document.createElement("div");
    logEntry.textContent = `Error: ${message}`;
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
