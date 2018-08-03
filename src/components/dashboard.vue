<template>
<div>
    <Row>
        <Col :xs="{ span: 20, offset: 1 }" :sm="{ span: 20, offset: 1 }" :md="{ span: 20, offset: 1 }" :lg="{ span: 11, offset: 1 }">
            <Card>
                <p slot="title" style="color:white"><Icon type="ios-people"></Icon> Total Participants</p>
                <div style="text-align:center">
                    <h3>{{ participantscount }}</h3>
                </div>
            </Card>
        </Col>
        <Col :xs="{ span: 20, offset: 1 }" :sm="{ span: 20, offset: 1 }" :md="{ span: 20, offset: 1 }" :lg="{ span: 11, offset: 1 }">
            <Card>
                <p slot="title" style="color:white"><Icon type="md-menu" /> Total ETH Donated</p>
                <div style="text-align:center">
                    <h3>{{ ethsent }}</h3>
                </div>
            </Card>
        </Col>
    </Row>
    <br>
    <Row>
        <Col :xs="{ span: 20, offset: 1 }" :sm="{ span: 20, offset: 1 }" :md="{ span: 20, offset: 1 }" :lg="{ span: 11, offset: 1 }">
            <piechart :data="chartData"></piechart>
        </Col>
        <Col :xs="{ span: 20, offset: 1 }" :sm="{ span: 20, offset: 1 }" :md="{ span: 20, offset: 1 }" :lg="{ span: 11, offset: 1 }">
            <Scroll :on-reach-bottom="handleReachBottom">
                <Table stripe size="small" :loading="loading" :columns="columns1" :data="list1"></Table>
            </Scroll>
        </Col>

    </Row>
</div>    
</template>

<script>
import DataChart from '@/components/chart';
import web3 from '../router/web3';
import lottery from '../lottery';
export default {
    components: { piechart:DataChart },
    data () {
        return{
            loading: true,
            participantscount: 0,
            ethsent: 0,
            chartData : [0,0],
            columns1: [
                {
                    title: 'Address',
                    key: 'address'
                },
                {
                    title: 'Donation',
                    key: 'donation',
                    sortable: true
                }
            ],
            list1: []
        }
    },
    methods:{
        handleReachBottom () {
            return new Promise(resolve => {
                setTimeout(() => {
                    const last = this.list1[this.list1.length - 1];
                    for (let i = 1; i < 11; i++) {
                        this.list1.push(last + i);
                    }
                    resolve();
                }, 2000);
            });
        },
        tabledata (participants) {
            console.log('​tabledata -> participants', participants);
            var rows = [];
            var boypicks = 0;
            var girlpicks = 0;
            participants[0].forEach(function(participant, index, array) {
                const row = new Object();
                const babypick =  web3.utils.fromWei(participants[1][index],'ether');
                row.address = participant;
                row.donation = babypick;
                rows.push(row);
            });
            this.chartData = [participants[2], participants[3]];
            return rows;
        }
    },
    created () {
      
        lottery.methods.manager().call().then(response => { 
        }, error => {
            console.error("Got nothing from server. Prompt user to check internet connection and try again")
        });

        lottery.methods.donatedAmount().call().then(balance => {
            let balances = (web3.utils.fromWei(balance,'ether'))*1;
            this.ethsent = balances.toFixed(3);
        });

        lottery.methods.getParticipants().call().then(response =>{
            this.list1 = this.tabledata(response);
            this.participantscount = response[0].length;
            this.loading= false;
        });
        
    }
}
</script>

<style scoped>
.ivu-card {
    background-color: #19be6b;
}
</style>

