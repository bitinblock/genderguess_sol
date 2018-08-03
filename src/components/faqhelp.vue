<template>
    <div>
         <Row>
            <Col span="24">
                <Collapse v-model="value1" accordion>
                    <Panel name="1">
                        <span class="panel-header-text">What is this about?</span>
                        <p slot="content">This is a simple guess game created by a soon-to-be dad. In order to participate one should have browser installed with metamask and a kind heart. 
                            To be considered as participant, one should guess the baby's gender that is to be born in November and should donate atleast 0.01ETH to the <a href="https://support.binance.com/hc/en-us/articles/360007069891-West-Japan-Disaster-Relief-Donation" target="_blank"> Binance West Japan Disaster Relief</a> through this website.
                            In first week of November, two lucky winners will be picked from the correctly guessed pool and the contract balance amount will be shared among those two winners.
                            If you would like to increase the prize money by sending ETH to contract you are welcome to do so. <a href="" @click.stop.prevent="modal2 = true">Click here to increase reward.</a>
                            Current total prize reward is {{ ethamount }}ETH (~$ {{ dollarPrice }})
                        </p>
                    </Panel>
                    <Panel name="2">
                        <span class="panel-header-text">Is Binance associated or in any way related to this website?</span>
                        <p slot="content">No. They are not related in any way and may not even heard of it</p>
                    </Panel>
                    <Panel name="3">
                        <span class="panel-header-text">What is in it for you?</span>
                        <p slot="content">A million Dollar, worth of satisfaction. 
                            There is no financial benefit in this for us. 
                            The idea started with a small family game then thought when it can be opened to world through blockchain and if atleast a couple of people play this then why not be a part of the cause?
                        </p>
                    </Panel>
                    <Panel name="4">
                        <span class="panel-header-text">Who are you and how to trust?</span>
                        <p slot="content"> I am {{ manager }}. Yes don't trust, verify {{ contract }}. 
                            As we move into the future, the names and faces become irrelavant and the trust is formed through smart contracts.
                        </p>
                    </Panel>
                    <Panel name="5">
                        <span class="panel-header-text">Can the game be voided? What happen to the prize amount then?</span>
                        <p slot="content"> Yes. The game will be voided if there are less than 100 participants and also if number of participants in each gender pool is less than 30. In such scenario all the prize amount will be sent to the binance donation address.
                        </p>
                    </Panel>
                    <Panel name="6">
                    <span class="panel-header-text">How to participate?</span>
                        <p slot="content">This <a href="https://www.youtube.com/watch?v=2YeyTF5lalE" target="_blank">video</a> will guide on how to install and operate with Metamask. Once you are comfotable proceed to <a href="#/participate">Participate</a><br>
                            <Row>
                                <Col span="24" offset="2">
                                    <ul>
                                        <li>Click on the picture to select. Boy on the left and Girl on the right </li>
                                        <li>Enter the amount of ETH you want to donate. Minimum is 0.01 ETH</li>
                                        <li>Submit your selection</li>
                                    </ul>
                                </Col>
                            </Row>
                        </p>
                    </Panel>
                    <Panel name="7">
                        <span class="panel-header-text">Why is there a aestrik next to Prize ?</span>
                        <p slot="content">
                            Not all participants will win prize. 
                            From all the addresses which correctly guessed the gender, two participants will be picked by contract and only those two will win prize. 
                        </p>
                    </Panel>
                    <Panel name="8">
                        <span class="panel-header-text">Why is submit button disabled?</span>
                        <p slot="content">
                            In multiple instances you will notice that submit button is disabled <br>
                            <Row>
                                <Col span="24" offset="2">
                                    <ul>
                                        <li>All the previous steps are not completed</li>
                                        <li>Metamask is not recognized</li>
                                    </ul>
                                </Col>
                            </Row>
                        </p>
                    </Panel>    
                    <Panel name="9">
                        <span class="panel-header-text">Is their a limitation on how many times one can participate?</span>
                        <p slot="content">Yes. Only one entry is accepted from one address. Also there are no geo restrictions on who can participate.</p>
                    </Panel>
                    <Modal v-model="modal2" width="360">
                        <p slot="header" style="color:#19be6b;text-align:center">
                            <Icon type="ios-information-circle"></Icon>
                            <span>Thank you!</span>
                        </p>
                        <div style="text-align:center">
                            <p>This act of yours will encourage many new participants to donate!</p>
                        </div>
                        <div slot="footer">
                            <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
                                <FormItem prop="user">
                                    <!-- <Input type="text" v-model="formInline.user" placeholder="Enter ETH Amount..."> -->
                                    <InputNumber style="width:100%" :min="0.01" size="large" v-model="ethvalue"></InputNumber>
                                   
                                </FormItem>
                                <FormItem>
                                    <Button type="primary" @click="handleSubmit('formInline')">Send</Button>
                                </FormItem>
                            </Form>
                        </div>
                    </Modal>
                </Collapse>
            </Col>
         </Row>
    </div>
</template>
<script>
import web3 from '../router/web3';
import lottery from '../lottery';
export default {
    name: 'faqhelp',
    data () {
        return{
              value1:'1',
              dollarPrice:'',
              ethvalue:0,
              ethaddress:'',
              contract:'',
              prizemoney:'',
              ethamount:'',
              manager:'',
              modal2: false,
                           formInline: {
                    user: '',
                    password: ''
                },
                ruleInline: {
                    user: [
                        { required: true, message: 'Please fill in the amount in ETH', trigger: 'blur' }
                    ]
                }
        }
    },
    methods:{
        getEthPrice (amount){
            var self=this;
            this.$http.get('https://api.coinmarketcap.com/v2/ticker/1027/').then(function(response){
                if(response.status == "200"){
                    self.dollarPrice = (response.data.data.quotes.USD.price) * amount
                }
            })
        },
        handleSubmit(name) {
            var getThis = this;
            lottery.methods.increaseReward().send({
                    from: getThis.ethaddress,
                    value: web3.utils.toWei(getThis.ethvalue.toString(),'ether'),
                    gasPrice: '10000000000', // 90 GWei
                    gas: 200000
            })
            .once('transactionHash', function(hash){ 
                getThis.$Spin.hide();
                getThis.$Notice.success({
                title: 'Thank you',
                render: h => {
                    return h('span', [
                        'Track your transaction ',
                        h('a', { 
                            attrs: { 
                            href: 'https://rinkeby.etherscan.io/tx/'+hash,
                            target:'_blank'
                            }
                        }, 'here.'),
                        'It  might take upto 60 seconds to see the confirmation!'
                    ])
                },
                duration: 60
                });
            })
            .on('error', function(error){ 
                getThis.$Spin.hide();
                getThis.$Notice.error({
                    title: 'Oops Something went wrong!',
                    desc: (error+"").split('\n')[0],
                    duration: 30
                });
            })
        }
    },
    mounted: function () {
       // this.getEthPrice();
    },
    created () {
        var instanceThis = this;
        lottery.methods.manager().call().then(address => {
            instanceThis.manager = address;
        })
        lottery.methods.getRewardAmount().call().then(amount => {
            amount = web3.utils.fromWei(amount,"ether");
            instanceThis.ethamount = amount;            
            instanceThis.getEthPrice(amount);
        })
        var firstAccount;
        web3.eth.getAccounts().then(e => { 
        firstAccount = e[0];
        if (!firstAccount){
            //this.nometamask = true;
        } else {
            this.ethaddress = firstAccount;
        }
        });
    }
}
</script>

<style scoped>
div.ivu-collapse-item {
  text-align: left ;
}

p {
  font-size: calc(0.75em + 1vmin);
}

</style>
