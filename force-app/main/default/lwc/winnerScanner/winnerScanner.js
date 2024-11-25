// barcodeScannerMultiScan.js
import { LightningElement, track, api } from "lwc";
import { getBarcodeScanner } from "lightning/mobileCapabilities";
import createParticipant from '@salesforce/apex/raffleHandler.createParticipant';

export default class EventScanner extends LightningElement {
  barcodeScanner;
  @track scannedBarcodes;
  @api accountId;

  connectedCallback() {
    this.barcodeScanner = getBarcodeScanner();
  }

  beginScanning() {
    // Set your configuration options, including bulk and multi-scanning if desired, in this scanningOptions object
    const scanningOptions = {
      barcodeTypes: [this.barcodeScanner.barcodeTypes.QR],
      scannerSize: "FULLSCREEN",
      cameraFacing: "BACK",
      showSuccessCheckMark: true,
      enableBulkScan: false,
      enableMultiScan: false,
    };

    // Make sure BarcodeScanner is available before trying to use it
    if (this.barcodeScanner != null && this.barcodeScanner.isAvailable()) {
      // Reset scannedBarcodes before starting new scanning session
      this.scannedBarcodes = [];

      // Start scanning barcodes
      this.barcodeScanner
        .scan(scanningOptions)
        .then((results) => {
          this.processScannedBarcodes(results);
        })
        .catch((error) => {
          this.processError(error);
        })
        .finally(() => {
          this.barcodeScanner.dismiss();
        });
    } else {
      console.log("BarcodeScanner unavailable. Non-mobile device?");
    }
  }

  processScannedBarcodes(barcodes) {
    // Do something with the barcode scan value:
    // - look up a record
    // - create or update a record
    // - parse data and put values into a form
    // - and so on; this is YOUR code
    console.log(JSON.stringify(barcodes));
    this.scannedBarcodes = this.scannedBarcodes.concat(barcodes);
    this.accountId = this.scannedBarcodes.map((barcode) => barcode.value).join("");
  }

  processError(error) {
    // Check to see if user ended scanning
    if (error.code == "USER_DISMISSED") {
      console.log("User terminated scanning session.");
    } else {
      console.error(error);
    }
  }

  get scannedBarcodesAsString() {
    return this.scannedBarcodes.map((barcode) => barcode.value).join("\n");
  }
}