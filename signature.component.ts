import { Component, OnInit, ViewChild, HostListener, EventEmitter, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-signature',
  template: '<canvas #canvas></canvas>',
  styles: ['signature.component.scss']
})
export class SignatureComponent implements OnInit {

  @ViewChild('canvas') canvasElementRef: ElementRef;

  segments: Segment[] = [];
  savedSignatureAsDataUrl: EventEmitter<string> = new EventEmitter<string>();
  isFocused: boolean;

  get canCancel(): boolean { return this.segments.length === 0; }

  private get canvas(): HTMLCanvasElement { return this.canvasElementRef.nativeElement; }
  private get context(): CanvasRenderingContext2D { return this.canvas.getContext("2d"); }
  private isMouseDown: boolean;

  @HostListener("window:resize", ["$event"]) onWindowResize =
    ($event: UIEvent) => this.resizeCanvas()

  @HostListener("document:click", ["$event"]) onClickOutsideSignature =
    ($event: TouchEvent) => this.isFocused = this.canvas.contains($event.target as Node)

  @HostListener("document:mousedown", ["$event"]) onDocumentMouseDown =
    ($event: TouchEvent) => this.isFocused = this.canvas.contains($event.target as Node)

  @HostListener("document:touchmove", ["$event"]) onDocumentTouchMove =
    ($event: TouchEvent) => this.isMouseDown = this.isFocused = this.canvas.contains($event.target as Node)

  @HostListener("document:mouseup", ["$event"]) onDocumentMouseUp =
    ($event: TouchEvent) => this.isMouseDown = false

  @HostListener("document:scroll", ["$event"]) onDocumentScroll =
    ($event: MouseEvent) => {
      if (this.isFocused) {
        $event.preventDefault();
      }
    }

  @HostListener("document:wheel", ["$event"]) onDocumentWheel =
    ($event: MouseWheelEvent) => {
      if (this.isFocused) {
        $event.preventDefault();
      }
    }

  @HostListener("touchstart", ["$event"]) ontouchstart =
    ($event: TouchEvent) => this.drawDown(this.getTouchLocation($event.touches[0]))

  @HostListener("touchmove", ["$event"]) ontouchmove =
    ($event: TouchEvent) => this.drawMove(this.getTouchLocation($event.touches[0]))

  @HostListener("touchend", ["$event"]) ontoucheend = ($event: TouchEvent) => this.isMouseDown = false;

  @HostListener("mousedown", ["$event"]) onmousedown =
    ($event: MouseEvent) => this.drawDown(this.getTouchLocation($event))

  @HostListener("mousemove", ["$event"]) onmousemove =
    ($event: MouseEvent) => this.drawMove(this.getTouchLocation($event))

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    this.resizeCanvas();
    this.clear();
    this.element.nativeElement.style.background = 'white';
    (document.body as HTMLElement).style.userSelect = 'none';
  }

  private resizeCanvas(): void {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.refreshCanvas();
  }

  private drawDown(point: Point): void {
    this.isMouseDown = true;
    this.segments.push({ points: [point] });
    this.refreshCanvas();
  }

  private drawMove(point: Point): void {
    if (!this.isMouseDown) { return; }
    this.segments[this.segments.length - 1].points.push(point);
    this.refreshCanvas();
  }

  save = () => this.savedSignatureAsDataUrl.emit(this.canvas.toDataURL());

  clear = () => {
    this.segments = [];
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private refreshCanvas(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.segments.filter(s => s.points.length).forEach(s => {
      this.context.moveTo(s.points[0].x, s.points[0].y);
      s.points.forEach(p => this.context.lineTo(p.x, p.y));
    });
    this.context.stroke();
  }

  private getTouchLocation(touchLocation: TouchLocation): Point {
    const rect: ClientRect = this.canvas.getBoundingClientRect();
    return {
      x: touchLocation.clientX - rect.left,
      y: touchLocation.clientY - rect.top
    };
  }
}

export interface TouchLocation {
  clientX: number;
  clientY: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  points: Point[];
}
