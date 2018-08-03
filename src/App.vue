<template>
  <div id="app">
      <Row>
        <Col span="14" offset="5">
          <img id="header" src="./assets/boyorgirl.jpg">
        </Col>
      </Row>
      <Row>
        <Col span="12" offset="6">
          <h1>Guess the Gender. <span class="linebreaker">Win a prize*!</span><i> But first Donate</i></h1>
        </Col>
      </Row>
      <Row>
        <Col span="12" offset="6">
          <Tabs @on-click="changepage" style="width:100%" :value="selectedTab">
                  <TabPane name="participate" label="Participate" icon="ios-compose"></TabPane>
                  <TabPane name="dashboard" label="Dashboard" icon="stats-bars"></TabPane>
                  <TabPane name="checkstatus" label="Check Participation" icon="checkmark-circled"></TabPane>
                  <TabPane name="faq" label="F.A.Q" icon="help-circled"></TabPane>
                  <TabPane v-if="admin" name="admin" label="Admin Console" icon="help-circled"></TabPane>
              </Tabs>
        </Col>
      </Row>
      <div id="content">
        <Row>
          <Col span="12" offset="6">
            <router-view/>
          </Col>
        </Row>
      </div>
  </div>
</template>

<script>
import web3 from './router/web3';
import lottery from './lottery';
export default {
  name: 'Apps',
  data () {
    return {
      theme1: 'light',
      selectedTab:this.$router.currentRoute.name,
      admin: false
    }
  },
  methods: {
    changepage (e) {
      this.$router.push({ path: e });
    }
  },
  created () {
    var firstAccount;
    web3.eth.getAccounts().then(e => { 
      firstAccount = e[0];
      lottery.methods.manager().call().then(manager =>{
        if (firstAccount==manager){
          this.admin=true
        } else {
          this.admin=false
        }
      })
    })
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 10px 0 10px 0;
}

img#header{
  height: 150px;
  width: auto;
}

h1, h2 {
  /* font-weight: normal; */
  font-size: calc(0.75em + 1.75vmin);
}

div#content {
  height: 90vh
}

@media only screen and (max-width: 500px) {
    /* For mobile phones: */
    span.linebreaker {
        display: block;
    }

}
</style>
