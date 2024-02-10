import { LightningElement, api, track  } from 'lwc';
import getItemOpportunidade from '@salesforce/apex/TesteEvery.getOportunidade';
import atualizarItensCls from '@salesforce/apex/TesteEvery.atualizarItens';
import buscarPrecoProduto from '@salesforce/apex/TesteEvery.buscarPrecoProduto';
export default class TesteEvery extends LightningElement {


    @api recordId;

    @track oportunidadeItens = [];
    @track oportunidadeExcluirItens = [];
    @track totalPreco =0;
    @track totalQuant =0;

    connectedCallback() {
        this.getItens();
    }

    getItens(){
        getItemOpportunidade({
            oportunidadeId : this.recordId
        })
        .then(result => {
            this.oportunidadeItens = result;
            this.totalizador();
        })
    }

    changeValues(event){
        debugger
        let produtoEdicao = this.oportunidadeItens.filter( item => item.Id == event.target.record)[0];
         switch(event.target.dataset.id){
            case 'produto':
                    produtoEdicao.idProduto = event.target.value;
                    buscarPrecoProduto({
                        produtoId : produtoEdicao.idProduto,
                        oportunidadeId: this.recordId
                    }).then(result =>{
                        if(produtoEdicao.idProduto != ''){
                            produtoEdicao.preco =  result;
                        }else{
                            produtoEdicao.preco = 0;
                        }
                    })
                break;
            case 'quantidade':
                    produtoEdicao.quantidade = Number(event.target.value);
                    produtoEdicao.preco  = produtoEdicao.quantidade * produtoEdicao.preco;

                break;
            case 'preco':
                    produtoEdicao.preco = Number(event.target.value);

                break;

    
         }
        this.oportunidadeItens = this.oportunidadeItens.filter( item => item.Id != event.target.record);
        this.oportunidadeItens.push(produtoEdicao);
        this.oportunidadeItens.sort((a, b) => a.Id - b.Id);
        this.totalizador();
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
    totalizador (){
        this.totalQuant =0;
        this.totalPreco =0;
        if (this.oportunidadeItens.length >0) {
            for(let item of this.oportunidadeItens){
                this.totalQuant += item.quantidade;
                this.totalPreco += item.preco;
            }}
    }


}