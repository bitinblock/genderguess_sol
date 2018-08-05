<template>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="Check" prop="check">
            <Input v-model="formValidate.check" placeholder="Enter Wallet Address..."></Input>
            <Tag type="border" :color="color" v-if="statushow">{{ message }}</Tag>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="handleSubmit('formValidate')">Submit</Button>
            <Button @click="handleReset('formValidate')" style="margin-left: 8px">Reset</Button>
        </FormItem>
    </Form>
</template>

<script>
import web3 from '../router/web3';
import lottery from '../lottery';
export default {
    name: 'checkstatus',
    data () {
        return{
                message:'',
                color:'',
                statushow:false,
                formValidate: {
                    check: ''
                },
                ruleValidate:{
                    check: [
                        { required: true, message: 'Please fill in the wallet address', trigger: 'blur' },
                        { type: 'string', min: 42, max: 42, message: 'Invalid Ethereum address', trigger: 'blur' }
                    ]
                }
        }
    },
    methods: {
        handleSubmit (name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    lottery.methods.Wallets(this.formValidate.check).call().then(response =>{
                        if(response){
                            this.color = "green";
                            this.message = "Thank you! You have participated!";
                        } else {
                            this.color = "red";
                            this.message = "Sorry! You haven't participated yet.";
                        }
                        this.statushow = true;    
                    })
                } else {
                    this.$Message.error('Fail!');
                }
            })
        },
        handleReset (name) {
            this.$refs[name].resetFields();
            this.statushow = false;
        }
    },
    created () {
        var firstAccount;
        this.formValidate.check=this.$userEthAddress;
        web3.eth.getAccounts().then(e => { 
            firstAccount = e[0];
            if (firstAccount){
                this.formValidate.check=firstAccount;
            }
        })
    }
}
</script>
