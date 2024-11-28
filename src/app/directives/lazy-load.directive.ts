import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective {
  @Input() src: string = ''; 
  private placeholder: HTMLElement; 

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.placeholder = this.renderer.createElement('div');
    this.renderer.addClass(this.placeholder, 'loader');
  }

  ngAfterViewInit(): void {
    const parent = this.el.nativeElement.parentElement;
    this.renderer.insertBefore(parent, this.placeholder, this.el.nativeElement);

    this.renderer.setStyle(this.el.nativeElement, 'display', 'none');

    this.loadImage();
  }

  private loadImage(): void {
    const img = new Image();
    img.src = this.src;

    img.onload = () => {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.src);
      this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
      this.renderer.removeChild(this.el.nativeElement.parentElement, this.placeholder);
    };
  }

}
