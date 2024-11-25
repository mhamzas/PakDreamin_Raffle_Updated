// barcodeScannerMultiScan.js
import { LightningElement, track,api } from "lwc";
import { getBarcodeScanner } from "lightning/mobileCapabilities";
import createParticipant from '@salesforce/apex/raffleHandler.createParticipant';

export default class EventScanner extends LightningElement {
  barcodeScanner;
  @track scannedBarcodes;
  @api sessionId;
  @track scannedItems=0;
  @track outputdebug="";
  recAccounts = [];

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
      enableBulkScan: true,
      enableMultiScan: true,
    };

    // Make sure BarcodeScanner is available before trying to use it
    if (this.barcodeScanner != null && this.barcodeScanner.isAvailable()) {
      // Reset scannedBarcodes before starting new scanning session
      this.scannedBarcodes = [];
      //this.scannedItems = this.scannedBarcodes.length;

      // Start scanning barcodes
      this.barcodeScanner
        .scan(scanningOptions)
        .then((results) => {
          this.processScannedBarcodes(results);
          this.scannedItems++;
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

  createMap(element){
      let accRec = {
          sobjectType: 'Account',
          Id : element
      };

      this.recAccounts.push(accRec);
  }

  processScannedBarcodes(barcodes) {
    // Do something with the barcode scan value:
    // - look up a record
    // - create or update a record
    // - parse data and put values into a form
    // - and so on; this is YOUR code

    console.log(JSON.stringify(barcodes));
    //this.outputdebug=this.outputdebug+ '\nBarcode Response1='+ JSON.stringify(barcodes);
    this.scannedBarcodes = this.scannedBarcodes.concat(barcodes);

    try{
      //this.outputdebug= this.outputdebug+ '\nBefore ForEeach';
      barcodes.forEach((element) => this.createMap (element.value));
    } catch (error){
      this.outputdebug= this.outputdebug+ 'error='+ JSON.stringify(error);
    }

    //this.outputdebug= this.outputdebug+ '\nPassing to Apex:'+JSON.stringify(this.recAccounts);

    // Creating new Participant record.
    createParticipant({data:this.recAccounts, sessionId: this.sessionId, scan: true})
    .then(result =>{
        this.outputdebug= this.outputdebug+ '\nresult'+JSON.stringify(result);
        //this.message = result;
        //this.error = undefined;
        if(result !== undefined) {
            this.outputdebug = 'Registered Successfully!';
        }
        //this.showForm=false;
        //this.showSuccess=true;
    })
    .catch(error=>{
        //this.message = undefined;
        //this.error = error;
        //this.response = error.body.message;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'HHmm.. that did not work!',
                message: error.body.message,
                variant: 'error',
            }),
        );
        console.log("error", JSON.stringify(error));
        this.outputdebug= this.outputdebug+'\nError::'+JSON.stringify(error);
    });
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