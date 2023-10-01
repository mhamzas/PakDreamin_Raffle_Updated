trigger SessionKeyGenerator on Session__c (before insert, before update) {
    List<Session__c> SessionList = new List<Session__c>();
    for(Session__c l: Trigger.New){
        if(l.Key__c == null || l.AuthCode__c==null){
          
            if(l.Key__c == null){
                l.Key__c= EncodingUtil.convertToHex(Crypto.generateAesKey(128)).substring(0, 32);
            }
            if(l.AuthCode__c == null){
            	l.AuthCode__c = EncodingUtil.convertToHex(Crypto.generateAesKey(128)).substring(0, 32);
            }
            SessionList.add(l);
        }
    }
    //upsert SessionList;
}