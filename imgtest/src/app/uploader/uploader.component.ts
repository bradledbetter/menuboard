import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {
  // NOTE: turns out there's no direct support for file inputs in reactive forms.
  @ViewChild('fileInput') fileInput;
  @ViewChild('label') label;
  acceptTypes: string[];

  constructor(private http: Http) {
    this.acceptTypes = [
      'image/*',  // for cameras
      '.png', // for our extension check
      '.jpg',
      '.gif',
      '.jpeg',
      '.doc',
      '.docx',
      '.pdf'
    ];
  }

  ngOnInit() {
  }

  upload() {
    const fileBrowser = this.fileInput.nativeElement;
    if (fileBrowser.files && fileBrowser.files[0]) {
      const filename = fileBrowser.files[0].name;
      const ext = filename.substr(filename.lastIndexOf('.'));
      if (this.acceptTypes.includes(ext)) {
        const formData = new FormData();
        formData.append('label', this.label.nativeElement.value);
        formData.append('file', fileBrowser.files.item(0));
        return this.http
          .post('http://localhost:7531/image/upload', formData)
          .map(res => res.json())
          .subscribe(data => console.log(data));
      }
    }
  }
}
