<template>
<div>
  <div v-if="openParticipate">
    <!-- <Row>
      <Col span="12" offset="6">
        <Alert banner show-icon type="error" v-if="!metamaskPresent">
          <b>Notice:</b> Metamask not detected
          <template slot="desc">Metamask is either not signed-in or not on Rinkeby TestNetwork. Please sign-in and refresh the page</template>
        </Alert>
      </Col>
    </Row> -->
    <Steps :current="current" direction="vertical">
      <Step :title="'Select Gender: '+selectedGender" content="Click to select">
        <Row>
          <Col :xs="{ span: 11, offset: 1 }" :sm="{ span: 11, offset: 1 }" :md="{ span: 11, offset: 1 }" :lg="{ span: 11, offset: 1 }">
            <Button type="dashed">
              <img @click="selectedGender= 'Boy', girlSelected=false, boySelected=true; nextstep(0)" :src="boySelected ? getImgUrl('baby-boy.png') : getImgUrl('boy-crying.png')" alt="baby-boy">
            </Button>
          </Col>
          <Col :xs="{ span: 11, offset: 1 }" :sm="{ span: 11, offset: 1 }" :md="{ span: 11, offset: 1 }" :lg="{ span: 11, offset: 1 }">
            <Button type="dashed">
              <img @click="selectedGender= 'Girl', boySelected=false, girlSelected=true; nextstep(0)" :src="girlSelected? getImgUrl('baby-girl.png') : getImgUrl('girl-crying.png')" alt="baby-girl">
            </Button>
          </Col>
        </Row>
      </Step>
      <Step title="Enter ETH Amount" content="! We are on Test so be generous">
        <Row>
          <Col :xs="{ span: 20, offset: 1 }" :sm="{ span: 20, offset: 1 }" :md="{ span: 20, offset: 1 }" :lg="{ span: 20, offset: 1 }">
            <InputNumber @on-change="nextstep(1)" :disabled="disabled_1" :min="0.01" v-model="ethvalue"></InputNumber>
          </Col>
        </Row>
      </Step>
      <Step title="Submit" content="Button">
        <Row>
          <Col :xs="{ span: 20, offset: 1 }" :sm="{ span: 20, offset: 1 }" :md="{ span: 20, offset: 1 }" :lg="{ span: 20, offset: 1 }">
            <Button type="primary" size="large" @click.once="handleSubmit()" :disabled="disabled_3">Submit</Button>
          </Col>
        </Row>
      </Step>
    </Steps>
    <Modal
        v-model="agrementModal"
        title="Read Carefully and Click Ok to Agree"
        @on-ok="ok">
        <p>By clicking Ok <br>
          1) You understand that you have gone through the smart contract and understood the code. <br>
          2) You understand that the game can be cancelled if there are not enough participants. <br>
          3) You understand that their is a potential that you may not get the prize money even if you are part of the final two. <br>
          4) Under any circumstances, you cannt hold us liable for any of your losses!
        </p>
    </Modal>
  </div>
  <div v-if="closeParticipate">
    <Card style="width:320px">
      <div style="text-align:center">
        <img src="../assets/missed.png">
        <h3>Sorry! The event is closed</h3>
      </div>
    </Card>
  </div>
</div>
</template>
<script>
import web3 from '../router/web3';
import lottery from '../lottery';
export default {
  name: 'Participate',
  data () {
    return {
      selectedGender:'',
      girlSelected: true,
      boySelected: true,
      ethvalue: 0,
      current: 0,
      emailvalue:'',
      disabled_1: true,
      disabled_2: true,
      disabled_3: true,
      ethaddress:'',
      openParticipate:false,
      closeParticipate:false,
      agrementModal: false
    }
  },
  methods: {
    getImgUrl(pic) {
      return require('../assets/'+pic)
    },
    nextstep(currentstep){
      if (currentstep == 0){
        this.current = 1;
        this.disabled_1 = false;
      } else if (currentstep == 1){
         this.current = 2;
        if (this.metamaskPresent){
          lottery.methods.Wallets(this.ethaddress).call().then(response =>{
            console.log('​nextstep -> response', response);
            if(response){
                this.disabled_3 = true;
            } else {
              this.disabled_3 = false;
            }   
          })
        } else {
          this.disabled_3 = true;
        }
      }   
    },
    handleSpinCustom () {
      this.$Spin.show({
          render: (h) => {
              return h('div', [
                  h('Icon', {
                      'class': 'demo-spin-icon-load',
                      props: {
                          type: 'load-c',
                          size: 18
                      }
                  }),
                  h('div', 'Loading')
              ])
          }
      });
    },
    handleSubmit () {
      this.agrementModal = true;
    },
    ok () {
      this.handleSpinCustom();
      var selectedGender;
      if (this.girlSelected){
        selectedGender = "girl"
      } else {
        selectedGender = "boy"
      }
      var txData = web3.utils.asciiToHex(selectedGender);
      var getThis = this;
      lottery.methods.enter(txData).send({
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
                      href: 'https://etherscan.io/tx/'+hash,
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
  created () {
    var firstAccount;
    console.log(this.$ethAddressTest)
    web3.eth.getAccounts().then(e => { 
      firstAccount = e[0];
      if (!firstAccount){
        this.$metamaskPresent = false;
      } else {
       this.ethaddress = firstAccount;
      }
    });
 
    lottery.methods.checkIsOpen().call().then(status => {
      if (status){
        this.openParticipate = true;
      } else {
        this.closeParticipate=true;
      }
    });
  }
}
</script>
<style scoped>
.ivu-steps {
  text-align: left ;
}

img {
  height: auto;
  width: 100%;
}


.ivu-input-number {
  width:50%;
}

.ivu-input-wrapper {
  width:50%;
}

.ivu-alert {
  font-size: calc(0.5em + 1vmin);
}

@media only screen and (max-width: 1024px) {
    .ivu-input-wrapper {
      width: 100%;
    }

    .ivu-input-number {
      width:100%;
    }
}
</style>
