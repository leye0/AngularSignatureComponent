import { Component, OnInit, ViewChild, HostListener, EventEmitter, ElementRef, Output } from '@angular/core';

@Component({
  selector: 'app-signature',
  template: '<canvas #canvas></canvas>',
  styles: ['signature.component.scss']
})
export class SignatureComponent implements OnInit {

  @ViewChild('canvas') canvasElementRef: ElementRef;

  segments: Segment[] = [];
  @Output() savedSignatureAsDataUrl: EventEmitter<string> = new EventEmitter<string>();

  get canClear(): boolean { return this.segments.length >  0; }

  private get canvas(): HTMLCanvasElement { return this.canvasElementRef.nativeElement; }
  private get context(): CanvasRenderingContext2D { return this.canvas.getContext("2d"); }
  private isTouchingDown: boolean;
  private isTouchingInside: boolean;
  private previousUserSelectStyle: string;

  @HostListener("window:resize", ["$event"])
  onWindowResize = ($event: UIEvent) => this.resizeCanvas()

  @HostListener("document:mousedown", ["$event"])
  @HostListener("document:mousemove", ["$event"])
  @HostListener("document:touchstart", ["$event"])
  @HostListener("document:touchmove", ["$event"])
  touchOutside = ($event: MouseEvent) => this.handleTouchOutside($event, false)

  @HostListener("document:click", ["$event"])
  @HostListener("document:mouseup", ["$event"])
  @HostListener("document:touchend", ["$event"])
  touchUpOutside = ($event: MouseEvent) => this.handleTouchOutside($event, true)

  @HostListener("document:scroll", ["$event"]) onDocumentScroll =
    ($event: MouseEvent) => {
      if (this.isTouchingInside) {
        $event.preventDefault();
      }
    }

  @HostListener("document:wheel", ["$event"]) onDocumentWheel =
    ($event: MouseWheelEvent) => {
      if (this.isTouchingInside) {
        $event.preventDefault();
      }
    }

  @HostListener("touchstart", ["$event"])
  ontouchstart = ($event: TouchEvent) => this.drawDown($event, true)

  @HostListener("touchmove", ["$event"])
  ontouchmove = ($event: TouchEvent) => this.drawMove($event, true)

  @HostListener("touchend", ["$event"])
  ontoucheend = ($event: TouchEvent) => this.drawEnd()

  @HostListener("mousedown", ["$event"])
  onmousedown = ($event: MouseEvent) => this.drawDown($event, false)

  @HostListener("mousemove", ["$event"])
  onmousemove = ($event: MouseEvent) => this.drawMove($event, false)

  @HostListener("mouseup", ["$event"])
  onmouseup = ($event: MouseEvent) => this.drawEnd()

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    this.previousUserSelectStyle = (document.body as HTMLElement).style.userSelect;
    this.resizeCanvas();
    this.clear();
    this.element.nativeElement.style.background = 'white';
  }

  private resizeCanvas(): void {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.refreshCanvas();
  }

  private drawDown($event: any, isTouch: boolean): void {
    const touchLocationEvent: TouchLocationEvent = isTouch ? $event.touches[0] : $event;
    const point: Point = this.getTouchLocation(touchLocationEvent);
    (document.body as HTMLElement).style.userSelect = 'none';
    this.isTouchingDown = true;
    this.segments.push({ points: [point] });
    this.refreshCanvas();
  }

  private drawMove($event: any, isTouch: boolean): void {
    if (!this.isTouchingDown) { return; }
    const touchLocationEvent: TouchLocationEvent = isTouch ? $event.touches[0] : $event;
    const point: Point = this.getTouchLocation(touchLocationEvent);
    this.segments[this.segments.length - 1].points.push(point);
    this.refreshCanvas();
  }

  private drawEnd(): void {
    this.isTouchingDown = false;
    (document.body as HTMLElement).style.userSelect = this.previousUserSelectStyle;
  }

  private handleTouchOutside($event: any, up: boolean): boolean {
    const focused: boolean = this.canvas.contains($event.target as Node);
     this.isTouchingInside = focused;
     if (!focused && up) {
       this.drawEnd();
     }
     return !focused;
  }

  save(): void {
    this.savedSignatureAsDataUrl.emit(this.canvas.toDataURL());
  }

  clear(): void {
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

  private getTouchLocation(touchLocation: TouchLocationEvent): Point {
    const rect: ClientRect = this.canvas.getBoundingClientRect();
    return {
      x: touchLocation.clientX - rect.left,
      y: touchLocation.clientY - rect.top
    };
  }
}

export interface TouchLocationEvent {
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
