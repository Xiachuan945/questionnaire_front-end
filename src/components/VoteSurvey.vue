<script>
import Swal from 'sweetalert2';
export default {
    data() {
        return {
            // 問卷列表資料
            qnId:"", // 12.13
            title: "",
            description: "",
            is_published: false,
            startDate: "",
            endDate: "",
            // 問題題目資訊
            quId: "", // 12.11 
            qTitle: "",
            optionType: "",
            isNecessary: false,
            option: "",
            selectedOptions: [], // 儲存每個問題的選項
            // 基本資料
            name: "",
            age: "",
            phone: "",
            email: "",
            allQuestionnaire: [],

            // 後端撈回來的資料存回前端的陣列
            quList: [],

            userData: {}, // 顯示使用者作答資訊

        }
    },
    mounted() {
        this.findQnId();
    },
    methods: {
        // 撈後端的資料，找尋各列表所對應題目id，顯示在列表點進去的頁面
        findQnId() {
            // const quIdToFind = this.$route.params.quId;
            // const receiveObj = JSON.parse(quIdToFind);   // 轉成前端看得懂的資料
            // this.quId = receiveObj.id;  // 設定 quId
            const qnIdToFind = this.$route.params.qnId;
            const receiveObj = JSON.parse(qnIdToFind);   // 轉成前端看得懂的資料
            this.qnId = receiveObj.id;  // 設定 qnId
            // 將問卷資料接回來
            this.title = receiveObj.title;
            this.description = receiveObj.description;
            this.is_published = receiveObj.is_published;
            this.startDate = receiveObj.startDate;
            this.endDate = receiveObj.endDate

            fetch('http://localhost:8080/api/quiz/searchQuestionList?qnId=' + receiveObj.id, {
                method: "GET",
                headers: new Headers({
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                })
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
                    let newArray = []
                    if (Array.isArray(data.questionList)) {
                        for (let i = 0; i < data.questionList.length; i++) {
                            let options = data.questionList[i].option.split(';');
                            newArray.push({
                                qnId: data.questionList[i].qnId,
                                quId: data.questionList[i].quId,
                                qTitle: data.questionList[i].qTitle,
                                optionType: data.questionList[i].optionType,
                                is_necessary: data.questionList[i].isNecessary,
                                option: options,
                                selectedOption: null, // 問卷作答後的選項
                            });
                        }
                    }
                    this.quList = newArray;
                    console.log(newArray)
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        },
        // 確認問題答案
        checkAns() {
            // 使用 map 函式將 quList 陣列轉換為分開的 qnIds.quIds .selectedOptions陣列
            const qnIds = this.quList.map(question => question.qnId);
            const quIds = this.quList.map(question => question.quId);
            
            // 遍歷 quList 陣列，將每個問題的 selectedOption 設置為使用者的選擇
            for (let i = 0; i < this.quList.length; i++) {
                const question = this.quList[i];
                if (this.selectedOptions[i] !== undefined) {
                    question.selectedOption = this.selectedOptions[i];
                } else {
                    question.selectedOption = "未作答";
                }
            }

            // 收集使用者輸入的數據
            const userData = {
                name: this.name,
                age: this.age,
                phone: this.phone,
                email: this.email,
                selectedOptions: this.selectedOptions,
                qnIds: qnIds,  // 將所有問題的 qnId 收集到陣列中
                quIds: quIds,  // 將所有問題的 quId 收集到陣列中
                quList: this.quList,
            };
            // 更新 userData，在 checkAnsArea 中顯示
            this.userData = {
                name: this.name,
                age: this.age,
                phone: this.phone,
                email: this.email,
                selectedOptions: this.selectedOptions,
                qnIds: qnIds,  // 將所有問題的 qnId 收集到陣列中
                quIds: quIds,  // 將所有問題的 quId 收集到陣列中
            };

            // 使用 SweetAlert2 彈窗顯示資訊
            Swal.fire({
                title: "問卷確認！",
                icon: "info",
                showCancelButton: true,
                cancelButtonText: "修改",
                html: `
                        <p><strong>姓名:</strong> ${this.userData.name}</p>
                        <p><strong>年齡:</strong> ${this.userData.age}</p>
                        <p><strong>手機:</strong> ${this.userData.phone}</p>
                        <p><strong>信箱:</strong> ${this.userData.email}</p>
                        <p><strong>回答:</strong> ${this.userData.selectedOptions.join('; ')}</p>`,
            })
                .then((result) => {
                    if (result.isConfirmed) {
                        // 如果按下 OK 按钮，執行提交到後端的方法
                        this.submitUserDataToDb();
                    }
                })
            //資料傳遞到 CheckSurvey 頁，功能與 prop 相同
            // this.$router.push({
            //     name: "CheckSurvey",
            //     query: userData,
            // });
            // console.log("使用者數據:", userData);
            // console.log("問卷題目 qnIds:", qnIds);
            // console.log("問題 quIds:", quIds);
        },
        // 傳送回答到DB
        submitUserDataToDb() {
            const backendApi = 'http://localhost:8080/api/quiz/setUser';

            // 準備要傳遞到後端的資料
            const postData = {
                userList: []
            };

            for (const question of this.quList) {
                postData.userList.push({
                    name: this.userData.name,
                    phoneNumber: this.userData.phone,
                    email: this.userData.email,
                    age: this.userData.age,
                    qnId: question.qnId,
                    qId: question.quId,
                    ans: question.selectedOption,
                });
            }

            console.log(postData);
            fetch(backendApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    //根據後端回傳的結果執行相應的操作
                    if (data.rtnCode=="SUCCESSFUL") {
                        console.log(postData);
                        Swal.fire({
                            icon: 'success',
                            title: '資料已成功提交！',
                        });
                        // 問卷填寫成功後返回首頁
                        this.$router.push('/');
                    } else {
                        console.log(postData);
                        Swal.fire({
                            icon: 'error',
                            title: '資料提交失敗！',
                            text: '請稍後再試。',
                        });
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: '發生錯誤！',
                        text: '請稍後再試',
                    });
                });
        },
    }
}
</script>

<template>
    <div class="bgArea">

        <div class="timeArea">
            <p>投票時間：{{ this.startDate }} ~ {{ this.endDate }}</p>
        </div>

        <div class="titleArea">
            <h1 style="color: tomato;"><strong>{{ this.title }}</strong></h1>
            <h5 style="color: #D26900;"><strong> - - {{ this.description }} - - </strong></h5>
        </div>

        <div class="surveyArea">
            <!-- v-for 迭代顯示每個問題 -->
            <div v-for="(question, index) in quList" :key="index" class="questionContainer">
                <p class="questionItem"><strong>問題:</strong> {{ question.quId }}</p>
                <p class="questionItem"><strong>標題:</strong> {{ question.qTitle }}</p>
                <p class="questionItem"><strong>選項類型:</strong> {{ question.optionType }}</p>
                <p class="questionItem"><strong>是否必填:</strong> {{ question.is_necessary }}</p>
                <!-- <p class="questionItem"><strong>選項:</strong> {{ question.option }}</p> -->
                <div class="optionsContainer">
                    <template v-if="question.optionType === '單選題'">
                        <label v-for="(option, optionIndex) in question.option" :key="optionIndex">
                            <input type="radio" v-model="selectedOptions[index]" :value="option"
                                :name="'options_' + index" />
                            {{ option }}
                        </label>
                    </template>
                    <template v-else-if="question.optionType === '複選題'">
                        <label v-for="(option, optionIndex) in question.option" :key="optionIndex">
                            <input type="checkbox" v-model="selectedOptions[index]" :value="option"
                                :name="'options_' + index" />
                            {{ option }}
                        </label>
                    </template>
                    <template v-else-if="question.optionType === '簡答題'">
                        <label>
                            <input type="text" v-model="selectedOptions[index]" :name="'options_' + index" />
                        </label>
                    </template>
                </div>
            </div>
        </div>

        <div class="presonalInfoArea">
            <div class="leftPart">
                <div class="name">
                    <label for="Name">姓名</label>
                    <input v-model="name" type="text" placeholder="請輸入姓名" name="Name" required />
                </div>
                <div class="age">
                    <label for="Age">年齡</label>
                    <input v-model="age" type="number" placeholder="請輸入年齡" name="Age" required />
                </div>
            </div>
            <div class="rightPart">
                <div class="phone">
                    <label for="Phone">手機</label>
                    <input v-model="phone" type="tel" placeholder="請輸入電話號碼" name="Phone" required />
                </div>
                <div class="email">
                    <label for="Email">信箱</label>
                    <input v-model="email" type="email" placeholder="請輸入信箱" name="Email" required />
                </div>
            </div>
        </div>

        <div class="btnArea">
            <RouterLink class="routeritem" to="/">
                <button type="button" style="background-color: #DFFFDF;">取消</button>
            </RouterLink>
            <button type="button" style="background-color: #FFECF5;" @click="checkAns">確認</button>
        </div>

        <!-- 檢查問卷填寫資訊 -->
        <div class="checkAnsArea">
            <!-- <p v-if="userData.name">姓名：{{ userData.name }}</p>
            <p v-if="userData.age">年齡：{{ userData.age }}</p>
            <p v-if="userData.phone">手機：{{ userData.phone }}</p>
            <p v-if="userData.email">信箱：{{ userData.email }}</p>
            <p v-if="userData.selectedOptions">回答：{{ userData.selectedOptions.join(', ') }}</p> -->
        </div>
    </div>
</template>

<style lang="scss" scoped>
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
    height: 20vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    // border: 1px solid blue;
}

// .surveyArea {
//     width: 60vw;
//     height: 100vh;
//     display: flex;
//     flex-direction: column;
//     justify-content: center;
//     align-items: center;
//     margin-left: 20vw;
//     border: 5px solid greenyellow;
// }

.questionContainer {
    display: flex;
    flex-direction: column;
    // text-align: center;
    margin-bottom: 10px; // 調整問題間的間距
    width: 60vw;
    margin-left: 20vw;
    margin-top: 5vh;
    border-style: dotted;
    border-color: gold;

}

.questionItem {
    margin: 2;
}

.presonalInfoArea {
    width: 60vw;
    height: 20vh;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-left: 20vw;
    // border-style: dotted;
    // border-color: aquamarine;
    // border: 5px solid blue;

    .leftPart {
        width: 40vw;
        height: 20vh;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        text-align: center;
        // border: 5px solid gold;

    }

    .rightPart {
        width: 40vw;
        height: 20vh;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        text-align: center;
        // border: 5px solid greenyellow;
    }
}

// .directionArea {
//     width: 100vw;
//     height: 20vh;
//     display: flex;
//     flex-direction: column;
//     justify-content: center;
//     align-items: center;
// }

.btnArea {
    width: 100vw;
    height: 10vh;
    display: flex;
    justify-content: space-around;
    margin-top: 5vh;

    button {
        width: 10vw;
        height: 5vh;
        border: none;
        align-items: center;
        border-radius: 10px;
    }
}
</style>