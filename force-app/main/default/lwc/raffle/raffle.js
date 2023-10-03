import { LightningElement,wire,api } from 'lwc';
//import getParticipants from '@salesforce/apex/raffleHandler.getParticipants';
import getParticipants from '@salesforce/apex/raffleHandler.getParticipantsForRaffle';
import newWinner from '@salesforce/apex/raffleHandler.createRecord';
import getWinners from '@salesforce/apex/raffleHandler.getWinners';
import WinnerSuccess from '@salesforce/label/c.Winner_Success';

export default class Raffle extends LightningElement {
    @api sessionId;
    headerNames='Are you READY?';
    sessionName;
    // Add list of names here
    namesList = [];
    winners=[];
    winnerEmails = [];
    participants={};
    participantsAcc={};
    //partEmails = {};
    intervalHandle = null;
    showTimer = true;
    showStartBtn = false;
    showStopBtn = false;
    showWinner= false;
    item = '';
    label = {
        WinnerSuccess
    };

    rec = {
        sobjectType: 'Winners__c',
        Session__c: '',
        Participant__c: '',
        Account__c: ''
    };

    @wire(getParticipants, {sessionId: '$sessionId'})
    wiredParticipants({error, data}) {
        if (data) {
            // console.log(this.sessionId);
			 console.log('Participants: ' + JSON.stringify(data));
            this.sessionName = data[0].Session__r.Schedule_name__c;
            this.item = data[0].Session__r.SwagVoucher__c;

            // Getting all the Winners to compare with the namesList
            getWinners().then(result =>{
                this.winners = result;
                console.log('Winners'+JSON.stringify(result));
                // Winner Emails
                for(let i = 0; i < result.length; i++) {
                    this.winnerEmails.push(result[i].Participant__r.Webassessor_Email__c);
                }
                
            }).catch(error=>{
                console.log("error", JSON.stringify(error));
            });

            console.log('WinnerNames ::'+ JSON.stringify(this.winnerEmails));
            //Looping on all the participants
            for(let i = 0; i < data.length; i++) {
                // Populating Object/Map for Participants against their Name
                this.participants[data[i].Account__r.Name] = data[i].Id; 
                // Populating Object/Map for Participants against their AccountId
                this.participantsAcc[data[i].Account__r.Name] = data[i].Account__c; 
                //this.partEmails[data[i].Webassessor_Email__c] = data[i].Id;
                //console.log('this.winnerEmails.indexOf('+data[i].Webassessor_Email__c+')='+this.winnerEmails.indexOf(data[i].Webassessor_Email__c))
                // // Checking if this.winners doesn't contain this.partEmails
                if(this.winnerEmails.indexOf(data[i].Webassessor_Email__c) === -1) {
                    this.namesList.push(data[i].Account__r.Name);
                }

                // // Checking if participant is already in the winners list
                // if(this.winners.indexOf(data[i].Name) == -1) {
                //     if(!data[i].Name.includes("Saad")) {
                //         this.namesList.push(data[i].Name);
                //     }
                // }
            }
            this.showStartBtn=true;
            console.log('Eligible Names'+JSON.stringify(this.namesList));
        } else if (error) {
            console.log('error: ' + JSON.stringify(error));
            this.showStartBtn = false;
            this.showStopBtn = false;
            if(error.body.message){
                this.headerNames =error.body.message;
            }
        }
    }

    startRaffleHandler(event) {
        let i = 0;
        this.showStartBtn = false;
        this.showStopBtn = false;
        this.intervalHandle = setInterval(function () {
            this.headerNames = this.namesList[i++ % this.namesList.length];
        }.bind(this), 50); //https://omkardeokar95.medium.com/how-setinterval-is-bad-and-a-way-to-make-your-life-better-in-lwc-salesforce-8c0b2fc082da
    }

    startRaffle(event) {
        this.startRaffleHandler(event);

        setTimeout(() => {
            this.stopRaffle(event);
            },6000);
    }

    stopRaffle(event) {
        this.showStartBtn = false;
        this.showStopBtn = false;
        clearInterval(this.intervalHandle);
        this.showWinner=true;

        //Get Winner Name
        let winnerName = this.headerNames;
        // Getting Participant Id
        let participantId = this.participants[winnerName];
        let participantAccId = this.participantsAcc[winnerName];
        this.rec.Participant__c=participantId;
        this.rec.Account__c = participantAccId;
        this.rec.Name=winnerName;
        this.rec.Session__c=this.sessionId;
        console.log(JSON.stringify(this.rec));
        //Creating DB record
        newWinner({data:this.rec}).then(result =>{
                console.log(JSON.stringify(result));
        }).catch(error=>{
            console.log("error", JSON.stringify(error));
        });
    }
}