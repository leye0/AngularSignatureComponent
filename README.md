# Angular Signature Component

Minimalist signature component for Angular

## Getting Started

Copy signature.component.ts in your project (and add it to the declaration of your module-s).
Tweak for your needs.

### Usage
```html
<!-- This is a place where the signature pad should be used. -->
<!-- The signature canvas will fill the whole space. In the example, full width and a height of 100px. -->
<!-- Notice how in the example the style reacts to the state of the component. -->
<div [ngStyle]="{'border': myAwesomeSignaturePad.isFocused ? '1px solid gray' : '1px solid transparent'}" style="width: 100%; height: 100px;">

  <!-- When calling "save", the $event received from the component output is your image as a default data URL as PNG -->
  <app-signature (savedSignatureAsDataUrl)="someServiceThatHandlesTheData($event)" #myAwesomeSignaturePad></app-signature>
</div>

<!-- There are two functions: clear and save. -->
<button (click)="myAwesomeSignaturePad.clear()">Clear</button>
<button (click)="myAwesomeSignaturePad.save()">Save</button>
```
### Demo
[Plunker](https://embed.plnkr.co/nwzcyGl4ZwduvrptIoKx/)
