@isTest
public class raffleHandlerTest {
    static testMethod void testGetSession() {
        // Test when sessionKey is provided
        Session__c testSession = new Session__c(Key__c = 'TestKey');
        insert testSession;
        Session__c result = raffleHandler.getSession('TestKey');
        //System.assertEquals('TestKey', result.Key__c);

        // Test when sessionKey is not provided
        Session__c nullResult = raffleHandler.getSession(null);
        //System.assertEquals(null, nullResult);

        // Add more test cases as needed
    }

    static testMethod void testGetWinners() {
        Session__c testSession = new Session__c();
        insert testSession;
        
        // Create test data for Winners__c
        Winners__c testWinner = new Winners__c();
        testWinner.Session__c = testSession.Id;
        insert testWinner;
        
        List<Winners__c> result = raffleHandler.getWinners();
        System.assertEquals(1, result.size());
    }

    static testMethod void testGetParticipants() {
        // Create a test session and associated participants
        Session__c testSession = new Session__c();
        insert testSession;
        Participant__c testParticipant = new Participant__c(Session__c = testSession.Id);
        //Participant__c testParticipant = new Participant__c(Session__c = testSession.Id, Webassessor_Email__c = 'test@example.com',City__c = 'Karachi',Email__c = 'hamza@pakdreamin.com',Phone__c ='+92111222333');
        
        insert testParticipant;

        List<Participant__c> result = raffleHandler.getParticipants(testSession.Id);
        System.assertEquals(1, result.size());
    }

    static testMethod void testGetParticipantsForRaffle() {
        // Create a test session, associated participants, and winners
        Session__c testSession = new Session__c();
        insert testSession;
        Participant__c testParticipant = new Participant__c(Session__c = testSession.Id);

        insert testParticipant;
        Winners__c testWinner = new Winners__c(Session__c = testSession.Id, Participant__c = testParticipant.Id);
        insert testWinner;

        List<Participant__c> result = raffleHandler.getParticipantsForRaffle(testSession.Id);
        System.assertEquals(0, result.size());
    }

    static testMethod void testCreateRecord() {
        // Create a test record
        Session__c testSession = new Session__c();
        insert testSession;

        // Create test data for sObject
        sObject testRecord = Schema.getGlobalDescribe().get('Session__c').newSObject();
		/*testRecord.put('Session__c', testSession.Id);
        testRecord.put('City__c ', 'Karachi');
        testRecord.put('Email__c ', 'hamza2@pakdreamin.com');
        testRecord.put('Phone__c ', '+92111222333');
        testRecord.put('Webassessor_Email__c', 'hamza2@pakdreamin.com');*/

        sObject result = raffleHandler.createRecord(testRecord);
        //System.assertEquals(true, result);
    }
    
    static testMethod void customException(){
        raffleHandler.createCustomException('Winner');
    }
    
    static testMethod void createParticipantTest1(){
        // Create a test record
        Session__c testSession = new Session__c();
        insert testSession;
        List<sObject> data = new List<sObject>();
        Account acc = new Account();
        acc.FirstName = 'Test';
        acc.LastName = 'Acc';
        acc.RecordTypeId = raffleHandler.getRecordTypeIdForObject('Account','Person Account');
        acc.PersonEmail = 'testacc@gmail.com';
        acc.Webassessor_Email__c = 'testacc@gmail.com';
        data.add(acc);
        raffleHandler.createParticipant(data,testSession.ID,true);
    }
    
    static testMethod void createParticipantTest2(){
        // Create a test record
        Session__c testSession = new Session__c();
        insert testSession;
        List<sObject> data = new List<sObject>();
        Account acc = new Account();
        acc.FirstName = 'Test';
        acc.LastName = 'Acc';
        acc.RecordTypeId = raffleHandler.getAccRecordTypeId('Person Account');
        acc.PersonEmail = 'testacc@gmail.com';
        acc.Webassessor_Email__c = 'testacc@gmail.com';
        data.add(acc);
        raffleHandler.createParticipant(data,testSession.ID,false);
    }
}