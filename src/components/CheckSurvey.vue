<script>

</script>

<template>
   
</template>

<style lang="scss">

</style>
<!-- <script>
export default {
    data() {
        return {
            name: "",
            age: "",
            phone: "",
            email: "",
            selectedOptions: [],
            quList: [],
            qId: "",
        };
    },
    mounted() {
        // 從 $route.query 中獲取資料
        this.name = this.$route.query.name;
        this.age = this.$route.query.age;
        this.phone = this.$route.query.phone;
        this.email = this.$route.query.email;
        this.selectedOptions = this.$route.query.selectedOptions || [];
        this.quList = this.$route.query.quList || [];
        this.qnIds = this.$route.query.qnIds || [];
        this.quIds = this.$route.query.quIds || [];

        console.log("姓名：" + this.name + "；年齡：" + this.age + "；手機：" + this.phone +
            "；信箱：" + this.email + "；回答：" + this.selectedOptions +
            "；問卷題目 qnIds：" + JSON.stringify(this.qnIds) +
            "；問題題號 quIds：" + JSON.stringify(this.quIds));

        // 檢查 quList 是否包含所需的資訊
        console.log("問卷題目 quList:", JSON.stringify(this.quList));
    },
    methods: {
        submitUserDataToDb() {
            // 收集使用者輸入的數據
            const userDataList = [];
            // 確保 quList 有數據
            if (this.quList && this.quList.length > 0) {
                for (let i = 0; i < this.quList.length; i++) {
                    const question = this.quList[i];
                    userDataList.push({
                        name: this.name,
                        phoneNumber: this.phone,
                        email: this.email,
                        age: this.age,
                        qnId: question.qnId,
                        qId: question.quId,
                        ans: { [question.quId]: this.selectedOptions[i] },
                    });
                }
            }
            console.log(userDataList);

            fetch('http://localhost:8080/api/quiz/setUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userList: userDataList }), // userList 包裹 userDataList
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                }).then(data => {
                    console.log(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        },
    }
};
</script> -->

<!-- <template>
    <div class="bgArea">

        <div class="timeArea">
             <p>投票時間：12/1~12/30</p>
        </div>
        <div class="titleArea">
            <h1>問卷確認頁</h1>
        </div>
        <div class="showArea">
            <h5>姓名：{{ name }}</h5>
            <h5>年齡：{{ age }}</h5>
            <h5>手機：{{ phone }}</h5>
            <h5>信箱：{{ email }}</h5>
            <h5>回答：{{ selectedOptions }} </h5>
        </div>
        <div class="btnArea">
            <button type="button" style="background-color: #DFFFDF;" @click="$router.go(-1)">返回</button>
            <button type="button" style="background-color: #FFECF5;" @click="submitUserDataToDb">投票</button>
        </div>

    </div>
</template> -->

<!-- <style lang="scss" scoped>
.bgArea {
    width: 100vw;
}

.timeArea {
    width: 100vw;
    height: 10vh;
    display: flex;
    justify-content: center;
    align-items: center;
    // border: 5px solid blue;
}

.titleArea {
    width: 100vw;
    height: 10vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.showArea {
    width: 60vw;
    height: 40vh;
    margin-left: 20vw;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    border: 3px solid gold;
}

.btnArea {
    width: 100vw;
    height: 10vh;
    display: flex;
    justify-content: space-evenly;
    margin-top: 10vh;

    button {
        width: 10vw;
        height: 5vh;
        border: none;
        align-items: center;
        border-radius: 10px;
    }
}
</style> -->