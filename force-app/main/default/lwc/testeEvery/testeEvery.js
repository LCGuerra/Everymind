import { LightningElement, api, track  } from 'lwc';
import getItemOpportunidade from '@salesforce/apex/TesteEvery.getOportunidade';
import atualizarItensCls from '@salesforce/apex/TesteEvery.atualizarItens';
export default class TesteEvery extends LightningElement {


    @api recordId;

    @track oportunidadeItens = [];
    @track oportunidadeExcluirItens = [];
  
    connectedCallback() {
        this.getItens();
    }

    getItens(){
        getItemOpportunidade({
            oportunidadeId : this.recordId
        })
        .then(result => {
            this.oportunidadeItens = result;
        })
    }

    changeValues(event){
        debugger
        let produtoEdicao = this.oportunidadeItens.filter( item => item.Id == event.target.record)[0];
         switch(event.target.dataset.id){
            case 'produto':
                    produtoEdicao.idProduto = event.target.value;

                break;
            case 'quantidade':
                    produtoEdicao.quantidade = Number(event.target.value);

                break;
            case 'preco':
                    produtoEdicao.preco = Number(event.target.value);

                break;

    
         }
        this.oportunidadeItens = this.oportunidadeItens.filter( item => item.Id != event.target.record);
        this.oportunidadeItens.push(produtoEdicao);
        this.oportunidadeItens.sort((a, b) => a.Id - b.Id);
    }

    deleteItens(event){
        let produtoEdicao = this.oportunidadeItens.filter( item => item.Id == event.target.record)[0];
        this.oportunidadeItens = this.oportunidadeItens.filter( item => item.Id != event.target.record);

        this.oportunidadeExcluirItens = this.oportunidadeExcluirItens.filter( item => item.Id != event.target.record);
        this.oportunidadeExcluirItens.push(produtoEdicao);
    }

    atualizarItens(){
        atualizarItensCls({
            recordId : this.recordId,
            itemOportunidadeList: this.oportunidadeItens,
            deleteItemList: this.oportunidadeExcluirItens
        })
        .then(result =>{

        })
    }

    addItens(){
        this.oportunidadeItens.push({
            idProduto: '',
            preco: 0,
            quantidade: 0,
            Id: this.oportunidadeItens.length,
            idOportunidade: this.recordId
            
        });
    }

}