/**
 * @description       : 
 * @author            : M Hamza Siddiqui
 * @group             : 
 * @last modified on  : 09-18-2021
 * @last modified by  : M Hamza Siddiqui
**/
public without sharing class raffleHandler {
    public raffleHandler() {}

    public class CustomException extends Exception {}
    
    public static CustomException createCustomException(String message) {
        CustomException ex = new CustomException(message);
        ex.setMessage(message);
        return ex;
    }

    @AuraEnabled(cacheable=true)
    public static Session__c getSession(String sessionKey) { 
        Session__c session = new Session__c();
        if(!String.isEmpty(sessionKey)){
            session = [select id, Start_Date__c,Start_Time__c, End_Time__c, Schedule_name__c, AuthCode__c from Session__c where Key__c = :sessionKey];
            if(session != null){
                List<Winners__c> winners = [Select id, Name__c from Winners__c where Session__c=:session.Id];
                if(winners!=null && winners.size()>0){
                    throw createCustomException('Winner: '+winners[0].Name__c);
                }
            }
        }
        return session;
    }

    @AuraEnabled(cacheable=true)
    public static List<Winners__c> getWinners() { 
        List<Winners__c> winners = new List<Winners__c>();
        winners = [select id, Participant__r.Name__c, Participant__r.Webassessor_Email__c from Winners__c];
        return winners;
    }

    @AuraEnabled(cacheable=true)
    public static List<Participant__c> getParticipants(String sessionId) { 
        List<Participant__c> participants = new List<Participant__c>();
        if(!String.isEmpty(sessionId)){
            participants = [select id, Name__c, Session__r.Start_Time__c, Session__r.End_Time__c, Session__r.Schedule_name__c,Webassessor_Email__c from Participant__c where Session__r.Id = :sessionId];
        }

        if(participants!=null && participants.size()>0){
            List<Winners__c> winners = [Select id, Name__c from Winners__c where Session__c=:sessionId];
            if(winners!=null && winners.size()>0){
                throw createCustomException('Winner: '+winners[0].Name__c);
            }
        }
        return participants;
    }

    @AuraEnabled(cacheable=true)
    public static List<Participant__c> getParticipantsForRaffle(String sessionId) { 
        List<Participant__c> participants = new List<Participant__c>();
        Set<String> winnerEmailSet = new Set<String>();
        Map<string, List<Winners__c>> WinnersMap = new Map<string, List<Winners__c>>();
        List<Winners__c> winners = [Select id, Name__c, Session__c, Participant__r.Webassessor_Email__c from Winners__c];
        for (Winners__c winner : winners) {
            winnerEmailSet.add(winner.Participant__r.Webassessor_Email__c);

            if(WinnersMap.containsKey(winner.Session__c)){
                List<Winners__c> tempList = WinnersMap.get(winner.Session__c);
                tempList.add(winner);
                WinnersMap.put(winner.Session__c, tempList);
            } else {
                List<Winners__c> winnersList = new List<Winners__c>();
                winnersList.add(winner);
                WinnersMap.put(winner.Session__c, winnersList);
            }
        }
            
        if(!String.isEmpty(sessionId)){
            participants = [select id, Name__c, Account__c, Account__r.Name, Session__r.Start_Time__c, Session__r.End_Time__c, Session__r.Schedule_name__c, Session__r.SwagVoucher__c, Webassessor_Email__c from Participant__c where Session__r.Id = :sessionId and Webassessor_Email__c not in: winnerEmailSet];
        }

        if(participants!=null && participants.size()>0){
            //List<Winners__c> winners = [Select id, Name from Winners__c where Session__c=:sessionId and Participant__r.Webassessor_Email__c NOT in :participantsSet];
            if(WinnersMap.get(sessionId)!=null && WinnersMap.get(sessionId).size()>0){
                throw createCustomException('Winner: '+WinnersMap.get(sessionId)[0].Name__c);
            }
        }
        return participants;
    }

    @AuraEnabled
    public static sObject createRecord(sObject data){
        try{
            insert data;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        return data;
    }

    @AuraEnabled
    public static Id getRecordTypeIdForObject(String objName, String recTypeName) {
        return ((SObject)Type.forName(objName).newInstance())
            .getSObjectType()
            .getDescribe()
            .getRecordTypeInfosByName()
            .get(recTypeName)
            .getRecordTypeId();
    }

    @AuraEnabled
    public static Id getAccRecordTypeId(String recTypeName) {
        return Schema.SobjectType.Account.getRecordTypeInfosByName().get(recTypeName).getRecordTypeId();
    }

    public static List<sObject> removeDuplicates(List<sObject> data){
        Set<sobject> myset = new Set<sobject>();
        List<sobject> result = new List<sobject>();
        myset.addAll(data);
        result.addAll(myset);
        return result;
    }

    @AuraEnabled
    public static List<Participant__c> upsertParticipant(List<Participant__c> data){

        try{
            data = removeDuplicates(data);
            upsert data ExternalId__c;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        return data;
    }

    @AuraEnabled
    public static List<Account> upsertAccount(List<Account> data){
        try{
            data = removeDuplicates(data);
            upsert data Webassessor_Email__c;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        return data;
    }

    @AuraEnabled
    public static List<Participant__c> createParticipant(List<sObject> data, String sessionId, Boolean scan){
        try{

            List<Account> accData = new List<Account>();
            if(!scan){
               accData = upsertAccount(data);
            } else {
                if(data!=null && data.size()>0){
                    for(sObject sobj: data){
                        Account acc = new Account();
                        acc.Id = String.valueof(sobj.get('Id'));
                        accData.add(acc);
                    }
                }
            }

            if(!accData.isEmpty()){
                List<Participant__c> listofParticipants = new List<Participant__c>();
                for(Account acc : accData){
                    Participant__c part = new Participant__c();
                    part.Account__c = acc.Id;
                    part.Session__c = sessionId;
                    part.ExternalId__c = sessionId+'|'+acc.Id;
                    listofParticipants.add(part);
                }
                upsertParticipant(listofParticipants);
            }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        return data;
    }

    

}