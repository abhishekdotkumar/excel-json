import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as XLSX from 'xlsx';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  name = 'This is XLSX TO JSON CONVERTER';
  willDownload = false;
  jsonFilesArray: any[] = [];
  constructor(private sanitization: DomSanitizer) {}

  onFileChange(ev: any) {
    let workBook: any = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      this.setDownload(dataString, jsonData);
    };
    reader.readAsBinaryString(file);
  }

  setDownload(data: any, jsonData: any) {
    this.willDownload = true;
    setTimeout(() => {
      let inputData: any[] = Object.keys(jsonData).map((key) => [
        key,
        jsonData[key],
      ]);
      this.jsonFilesArray = [];
      for (let i = 0; i < inputData.length; i++) {
        let currentExcel = inputData[i];
        let currentExcelName = currentExcel[0];
        let currentExcelData = currentExcel[1];
        let fileName = `${currentExcelName}.json`;
        let url = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(currentExcelData)
        )}`;
        this.jsonFilesArray.push({
          id: i,
          name: fileName,
          json: this.sanitization.bypassSecurityTrustResourceUrl(url),
        });
        // const el: any = document.getElementById(`${i}`);

        // el.setAttribute(
        //   'href',
        //   `data:text/json;charset=utf-8,${encodeURIComponent(
        //     JSON.stringify(currentExcelData)
        //   )}`
        // );
        // el.setAttribute('download', `${currentExcelName}.json`);
      }
    }, 1000);
  }
}
