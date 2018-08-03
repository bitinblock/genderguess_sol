<template>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="Gender" prop="name">
            <Input v-model="formValidate.name" placeholder="Gender Reveal"></Input>
        </FormItem>
        <FormItem label="Secret" prop="secret">
            <Input v-model="formValidate.secret" placeholder="Secret Number"></Input>
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
        data () {
            return {
                ethaddress:'',
                formValidate: {
                    name: '',
                    secret: ''
                },
                ruleValidate: {
                    name: [
                        { required: true, message: 'The name cannot be empty', trigger: 'blur' }
                    ],
                    secret: [
                        { required: true, message: 'Mailbox cannot be empty', trigger: 'blur' },
                    ]
                }
            }
        },
        methods: {
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        var getThis = this;
                        var txData = web3.utils.asciiToHex(getThis.formValidate.name);
                        var secreatData = getThis.formValidate.secret;
                        console.log(txData,secreatData) 
                        console.log('​handleSubmit ->  getThis.ethaddress',  getThis.ethaddress);
                        lottery.methods.pickWinner(txData,secreatData).send({
                            from: getThis.ethaddress,
                            gasPrice: '20000000000', // 20 GWei
                            gas: 3000000
                        });
                    } else {
                        this.$Message.error('Fail!');
                    }
                })
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            }
        },
        created () {
            var firstAccount;
            web3.eth.getAccounts().then(e => { 
                firstAccount = e[0];
                if (firstAccount){
                    this.ethaddress=firstAccount;
                }
            })
        }
    }
</script>