public without sharing class TesteEvery {

    @AuraEnabled
    public static void getPricebookEntry(Id oportunidadeId){

        Opportunity oportunidade = [SELECT Id, Pricebook2Id FROM Opportunity WHERE Id =: oportunidadeId];

        List<PricebookEntry> priceList = [SELECT Id, Product2Id, Product2.Name FROM PricebookEntry WHERE Pricebook2Id =: oportunidade.Pricebook2Id AND isActive = true];
        System.debug(priceList[0].Product2.Name);
    }

    @AuraEnabled
    public static List<itemOportunidade> getOportunidade(Id oportunidadeId){

        Opportunity oportunidade = [SELECT Id, Pricebook2Id, (SELECT Id, Product2Id, Quantity, UnitPrice FROM OpportunityLineItems) FROM Opportunity WHERE Id =: oportunidadeId];
        List<itemOportunidade> itemOportunidadeList = new List<itemOportunidade>();
        decimal idSequencial = 0;
        for(OpportunityLineItem item: oportunidade.OpportunityLineItems){
            itemOportunidade itemOportunidade = new itemOportunidade();
            itemOportunidade.quantidade = item.Quantity;
            itemOportunidade.preco = item.UnitPrice;
            itemOportunidade.idProduto = item.Product2Id;
            itemOportunidade.idItem = item.Id;
            itemOportunidade.Id = idSequencial;
            itemOportunidade.idOportunidade = oportunidade.Id;
            idSequencial += 1;
            itemOportunidadeList.add(itemOportunidade);
        }
        return itemOportunidadeList;
    }

    @AuraEnabled
    public static Decimal buscarPrecoProduto(String produtoId, String oportunidadeId){
        Opportunity oportunidade = [select Id, Pricebook2Id FROM Opportunity WHere Id =: oportunidadeId];

        PricebookEntry preco = [Select id, unitPrice FROM PricebookEntry WHERE Pricebook2Id =: oportunidade.Pricebook2Id AND Product2Id =:produtoId];
        if(preco != null ){
            return preco.unitPrice;
        }else{
            return 0;
        }
    }   

     @AuraEnabled
    public static Boolean atualizarItens(String recordId, List<itemOportunidade> itemOportunidadeList, List<itemOportunidade> deleteItemList){
        Boolean criadoSucesso = false;

        Try{
            List<OpportunityLineItem> itensUpdate = new List<OpportunityLineItem>();
            for(itemOportunidade item :itemOportunidadeList ){
                OpportunityLineItem itemOportunidade = new OpportunityLineItem();
                itemOportunidade.Quantity = item.quantidade;
                itemOportunidade.UnitPrice = item.preco;
                itemOportunidade.Product2Id = item.idProduto;
                itemOportunidade.OpportunityId = recordId;
                if(item.idItem != null ){
                    itemOportunidade.Id = item.idItem;
                }else{
                    
                    itemOportunidade.OpportunityId = item.idOportunidade;
                }
                itensUpdate.add(itemOportunidade);
            }
            if(!itensUpdate.isEmpty()){
                System.debug(itensUpdate);
                upsert itensUpdate;
            }

            List<OpportunityLineItem> itensDelete = new List<OpportunityLineItem>();
            for(itemOportunidade item :deleteItemList ){
                OpportunityLineItem itemOportunidade = new OpportunityLineItem();
                itemOportunidade.Id = item.idItem;
                itensDelete.add(itemOportunidade);
            }

            if(!itensDelete.isEmpty()){
                delete itensDelete;
            }
            criadoSucesso = true;
            return criadoSucesso;

        } catch (Exception e) {
            
            return criadoSucesso;
        }
    }

    public class itemOportunidade{
         @AuraEnabled public Decimal Id { get; set; }
         @AuraEnabled public String idItem { get; set; }
         @AuraEnabled public String idOportunidade { get; set; }
         @AuraEnabled public Decimal quantidade { get; set; }
         @AuraEnabled public Decimal preco { get; set; }
         @AuraEnabled public String idProduto { get; set; }
    }
}