<script>
import Swal from 'sweetalert2'
export default {
    data() {
        return {
            propsObj: {
                qnId: "", // 保留原本的qnId
                title: "",
                description: "",
                is_published: false,
                startDate: "",
                endDate: "",
                // qnId: "",
                quId: "", //12/11 test
                q_title: "",
                optionType: "",
                is_necessary: false,
                option: "",
            },
            newQuestionnaireList: [],   // 新問卷列表的資料
            addedQuestionsList: [],     // 用於儲存新增的題目
            showQuestionsTab: false,    // 控制是否顯示新增題目的頁籤頁面
            editingIndex: -1,           // 新增編輯中的索引狀態
            isEditing: false,           // 控制editArea的顯示

            inputQnId: "",              // 用戶輸入的qnId
            userList: [],               // 儲存後端返回的user回答數據



        };
    },
    methods: {
        // 切換到第二個頁籤 (新增題目)
        switchToTab2() {
            document.getElementById("tab-2").checked = true;
        },
        // 返回至第一個頁籤 (新增問卷)
        backToTab1() {
            document.getElementById("tab-1").checked = true;
        },
        // 顯示新增問題的頁籤
        showQuestionsTabOnClick() {
            this.showQuestionsTab = true;
        },
        // 新增問卷
        addQuestionnaire() {
            let newQuestionnaire = {
                title: this.propsObj.title,
                description: this.propsObj.description,
                startDate: this.propsObj.startDate,
                endDate: this.propsObj.endDate,
            }
            this.newQuestionnaireList.push(newQuestionnaire);
        },
        // 新增題目到列表
        addQuestion() {
            let newQuestionList = {
                qnId: this.addedQuestionsList.length + 1, //  id 為遞增的數字
                quId: this.addedQuestionsList.length + 1,
                qTitle: this.propsObj.q_title,
                optionType: this.propsObj.optionType,
                necessary: this.propsObj.is_necessary,
                option: this.propsObj.option == "" ? "請輸入文字" : this.propsObj.option
            };
            this.addedQuestionsList.push(newQuestionList);
            // 清空輸入欄位
            this.propsObj.q_title = "";
            this.propsObj.optionType = "";
            this.propsObj.is_necessary = false;
            this.propsObj.option = "";
        },
        // 暫存到 LocalStorage
        saveToLocalStorage() {
            // 將 q_title、optionType、is_necessary、options 存入 propsObj
            this.propsObj.q_title = this.q_title;
            this.propsObj.optionType = this.optionType;
            this.propsObj.is_necessary = this.is_necessary;
            this.propsObj.option = this.option;
            // 將 propsObj 中的資料存入 localStorage
            localStorage.setItem("surveyData", JSON.stringify(this.propsObj));
            // 將 addedQuestions 中的資料存入 localStorage
            localStorage.setItem("addQuestion", JSON.stringify(this.addedQuestionsList));
            Swal.fire({
                icon: "success",
                title: "資料已儲存至本機！",
            });
        },
        // 取消表單操作，清空數據
        cancelFormAndNavigate() {
            this.propsObj = {
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                q_title: "",
                optionType: "",
                is_necessary: "",
                option: ""
            };
            // 返回 QuestionnaireList 頁面
            this.$router.push("QuestionnaireList");
        },
        // 刪除問卷中的問題
        deleteQuestion(index) {
            // 找到被選中的行之該行索引
            var selectedIndexes = this.addedQuestionsList
                .map((question, index) => ({ index }))   // map()：回傳一個值，透過函式內所回傳的值組成一個新陣列
                .filter(item => item.index === index);   // filter()：回傳一個陣列，條件是 return 後方為 true 的物件 → 搜尋符合條件的資料
            // 刪除選中的行
            selectedIndexes.forEach(selectedIndex => {
                this.addedQuestionsList.splice(selectedIndex, 1);
            });
            // 發送刪除請求，使用 selectedIndexes 中的索引資訊
            selectedIndexes.forEach(selectedIndex => {
                var questionToDelete = this.addedQuestionsList[selectedIndex];
                fetch('http://localhost:8080/api/quiz/deleteQuestion', {
                    method: "POST",
                    body: JSON.stringify({ quId: questionToDelete }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            });
        },
        // 顯示新增問題的頁籤
        showQuestionsTabOnClick() {
            this.showQuestionsTab = true;
        },
        // 新增題目並存至DB
        createQuestionAndSubmitToDb() {
            const objArrAll = {
                questionnaire: this.newQuestionnaireList,
                questionList: this.addedQuestionsList,
            }
            var url = 'http://localhost:8080/api/quiz/create';
            // var data = objArrAll
            var data = {
                "questionnaire": {
                    "title": this.propsObj.title,
                    "description": this.propsObj.description,
                    "published": false,
                    "startDate": this.propsObj.startDate,
                    "endDate": this.propsObj.endDate
                },
                // "questionnaire":this.newQuestionnaireList, //12/11  Test
                "question_list": this.addedQuestionsList
            };
            fetch(url, {
                method: "POST",
                body: JSON.stringify(data),
                // body: JSON.stringify(objArrAll),
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((response) => {
                    if (response.rtnCode == "SUCCESSFUL") {
                        Swal.fire({
                            icon: "success",
                            title: "問卷已成功建立！",
                        });
                        // 成功後建立問卷後跳轉至列表頁面
                        this.$router.push("QuestionnaireList");
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "問卷建立失敗！",
                        });
                    }
                })
                .catch((error) => console.error("Error:", error));
        },
        // 編輯題目
        editQuestion(index) {
            // 設定要編輯的題目索引
            this.editingIndex = index;
            // 將題目資訊填入 propsObj，用於表單顯示
            const questionToEdit = this.addedQuestionsList[index];
            this.propsObj.q_title = questionToEdit.qTitle;
            this.propsObj.optionType = questionToEdit.optionType;
            this.propsObj.is_necessary = questionToEdit.necessary;
            this.propsObj.option = questionToEdit.option;
        },
        // 顯示編輯表單
        showEditForm(index) {
            // 設定要編輯的題目索引
            this.editingIndex = index;
            // 將編輯資料填入propsObj
            const questionToEdit = this.addedQuestionsList[index];
            // this.propsObj.qnId = questionToEdit.qnId; // 設定qnId
            this.propsObj.quId = questionToEdit.quId; // 12/11 test
            this.propsObj.q_title = questionToEdit.qTitle;
            this.propsObj.optionType = questionToEdit.optionType;
            this.propsObj.is_necessary = questionToEdit.necessary;
            this.propsObj.option = questionToEdit.option;

            // 設定isEditing為true，顯示editArea
            // this.isEditing = true;

            // 顯示帶有編輯表單的SweetAlert模態對話框
            Swal.fire({
                title: '編輯問題',
                html: `
            <div class="editArea">
                <h6>問題：</h6>
                <input type="text" id="swal-q_title" placeholder="請輸入問題..." value="${this.propsObj.q_title}" required>
                <select id="swal-optionType" required>
                    <option value="單選題" ${this.propsObj.optionType === '單選題' ? 'selected' : ''}>單選題</option>
                    <option value="複選題" ${this.propsObj.optionType === '複選題' ? 'selected' : ''}>複選題</option>
                    <option value="簡答題" ${this.propsObj.optionType === '簡答題' ? 'selected' : ''}>簡答題</option>
                </select>
                <select id="swal-is_necessary" required>
                    <option value="true" ${this.propsObj.is_necessary ? 'selected' : ''}>必填</option>
                    <option value="false" ${!this.propsObj.is_necessary ? 'selected' : ''}>選填</option>
                </select>
                <h6>選項：</h6>
                <input type="text" id="swal-option" placeholder="多個答案以；分隔" value="${this.propsObj.option}" required>
            </div>
        `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                preConfirm: () => {
                    // 從SweetAlert模態對話框獲取值
                    this.propsObj.q_title = document.getElementById('swal-q_title').value;
                    this.propsObj.optionType = document.getElementById('swal-optionType').value;
                    this.propsObj.is_necessary = document.getElementById('swal-is_necessary').value === 'true';
                    this.propsObj.option = document.getElementById('swal-option').value;

                    // 調用updateQuestionnaire()函數
                    this.updateQuestionnaire();
                }
            });

        },
        // 取消編輯題目
        cancelEdit() {
            // 清空 propsObj 中的編輯資訊
            // this.propsObj.qnId = ""; // 清空qnId
            this.propsObj.quId = ""; // 12/11 test
            this.propsObj.q_title = "";
            this.propsObj.optionType = "";
            this.propsObj.is_necessary = false;
            this.propsObj.option = "";
            // 取消編輯，將 editingIndex 設為 -1
            this.editingIndex = -1;
            // 關閉編輯表單
            this.isEditing = false;
        },
        // 更新問卷
        updateQuestionnaire() {
            const updatedQuestion = {
                qnId: this.propsObj.qnId,
                quId: this.propsObj.quId,
                qTitle: this.propsObj.q_title,
                optionType: this.propsObj.optionType,
                necessary: this.propsObj.is_necessary,
                option: this.propsObj.option == "" ? "請輸入文字" : this.propsObj.option
            };
            // 更新問卷中的問題
            this.addedQuestionsList[this.editingIndex] = updatedQuestion;
            // 清空 propsObj 中的編輯資訊
            this.propsObj.q_title = "";
            this.propsObj.optionType = "";
            this.propsObj.is_necessary = false;
            this.propsObj.option = "";
            // 取消編輯，將 editingIndex 設為 -1
            this.editingIndex = -1;
            // 關閉編輯表單
            this.isEditing = false;
        },
        // 從資料庫中撈統計資料
        getUserData() {
            const qnId = this.inputQnId;  // 從data中取得用戶輸入的qnId

            // if (!qnId) {            //     
            //     console.error('該問卷目前未有統計數據');
            //     return;
            // }

            fetch(`http://localhost:8080/api/quiz/getUser?qnId=${qnId}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('資料回傳錯誤');
                    }
                    return response.json();
                })
                .then(data => {
                    // 處理後端返回的數據
                    if (data.rtnCode === 'SUCCESSFUL') {
                        // 儲存數據到 Vue 的 userList 中
                        this.userList = data.userList;
                    } else {
                        Swal.fire({
                            icon: "warning",
                            title: "該問卷目前未有統計數據！",
                        });
                        console.error('錯誤:', data.rtnCode);
                    }
                })
                .catch(error => {
                    console.error('錯誤:', error.message);
                });
        },
        // 顯示使用者回答資訊
        showUserInfo(user) {
            Swal.fire({
                icon: 'info',
                title: '問卷回答資訊',
                html: `
                <p><strong>姓名:</strong> ${user.name}</p>
                <p><strong>手機:</strong> ${user.phoneNumber}</p>
                <p><strong>信箱:</strong> ${user.email}</p>
                <p><strong>問卷:</strong> ${user.qnId}</p>
                <p><strong>題號:</strong> ${user.qId}</p>
                <p><strong>回答:</strong> ${user.ans}</p>
            `,
            });
        },
    }
}
</script>

<template>
    <div class="bgArea">

        <div class="topBtnArea" v-if="!showQuestionsTab">
            <button type="button" @click="showQuestionsTabOnClick">新增問卷與題目</button>
        </div>

        <div class="tabs" v-if="showQuestionsTab">
            <!--   tab group1 -->
            <input type="radio" id="tab-1" name="tab" checked="checked">
            <label for="tab-1">問卷</label>
            <div class="tab-content">
                <form onclick="return false">
                    <div class="tab1">
                        <h6>問卷名稱：</h6>
                        <input type="text" v-model="propsObj.title" placeholder="請輸入問卷名稱..." name="title" required />
                        <h6>問卷說明：</h6>
                        <input type="text" v-model="propsObj.description" placeholder="請輸入問卷說明..." name="description"
                            required />
                        <h6>開始時間：</h6>
                        <input type="date" v-model="propsObj.startDate" name="startDate" required />
                        <h6>結束時間：</h6>
                        <input type="date" v-model="propsObj.endDate" name="endDate" required />
                        <br />
                    </div>
                    <div class="btnArea">
                        <RouterLink class="routeritem" to="QuestionnaireList">
                            <button type="button" class="deleteBtn" @click="cancelFormAndNavigate">取消</button>
                        </RouterLink>
                        <button type="button" class="addBtn" @click="switchToTab2">下一步</button>
                    </div>
                </form>
            </div>

            <!--   tab group2 -->
            <input type="radio" name="tab" id="tab-2">
            <label for="tab-2">題目</label>
            <div class="tab-content">
                <form onclick="return false">
                    <div class="tab2">
                        <h6>問題：</h6>
                        <input type="text" v-model="propsObj.q_title" placeholder="請輸入問題..." name="q_title" required>
                        <select v-model="propsObj.optionType" name="optionType" required>
                            <option value="單選題">單選題</option>
                            <option value="複選題">複選題</option>
                            <option value="簡答題">簡答題</option>
                        </select>
                        <select v-model="propsObj.is_necessary" name="is_necessary" required>
                            <option value="true">必填</option>
                            <option value="false">選填</option>
                        </select>
                        <h6>選項：</h6>
                        <input type="text" v-model="propsObj.option" placeholder="多個答案以；分隔" name="options" required>
                        <br>
                        <button type="button" class="addQnBtn" @click="addQuestion">新增題目</button>
                    </div>
                    <div class="btnArea">
                        <button type="button" class="goBackBtn" @click="backToTab1">上一步</button>
                        <button type="submit" class="submitBtn" @click="saveToLocalStorage">暫存至網頁</button>
                    </div>
                </form>
            </div>

            <!--   tab group3 -->
            <input type="radio" name="tab" id="tab-3">
            <label for="tab-3">問卷回饋</label>
            <div class="tab-content">
                <input type="text" v-model="inputQnId" placeholder="輸入查看的問卷編號">
                <button type="button" @click="getUserData()"
                    style="border: none; margin-left: 10px; font-weight: bold;">查看數據</button>
                <div class="feedbackArea">
                    <table>
                        <thead>
                            <th>編號</th>
                            <th>姓名</th>
                            <th>填寫時間</th>
                            <th>回答數據</th>
                        </thead>
                        <tbody>
                            <tr v-for="(user, index) in userList" :key="index">
                                <td>{{ user.num }}</td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.dateTime }}</td>
                                <td>
                                    <button type="button" @click="showUserInfo(user)"
                                        style="border: none; font-weight: bold;">前往</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!--   tab group4 -->
            <input type="radio" name="tab" id="tab-4">
            <label for="tab-4">統計</label>
            <div class="tab-content">
                這是統計圖表你知道的~
            </div>
        </div>

    </div>

    <div class="addedQuestionsArea" v-if="showQuestionsTab">
        <table>
            <thead>
                <th>
                    <input type="checkbox">
                </th>
                <th>編號</th>
                <th>問題類型</th>
                <th>內容</th>
                <th>選項</th>
                <th>刪除</th>
                <th>編輯</th>
            </thead>

            <tbody>
                <tr v-for="(question, index) in addedQuestionsList" :key="index">
                    <td>
                        <input type="checkbox" v-model="question.selected">
                    </td>
                    <td>{{ question.quId }}</td>
                    <td>{{ question.optionType }}</td>
                    <td>{{ question.qTitle }}</td>
                    <td>{{ question.option }}</td>
                    <td><i class="fa-solid fa-trash" @click="deleteQuestion(index)"></i></td>
                    <td><i class="fa-solid fa-pen" @click="showEditForm(index)"></i></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- <div class="editArea" v-show="isEditing">
        <h6>問題：</h6>
        <input type="text" v-model="propsObj.q_title" placeholder="請輸入問題..." name="q_title" required>
        <select v-model="propsObj.optionType" name="optionType" required>
            <option value="單選題">單選題</option>
            <option value="複選題">複選題</option>
            <option value="簡答題">簡答題</option>
        </select>
        <select v-model="propsObj.is_necessary" name="is_necessary" required>
            <option value="true">必填</option>
            <option value="false">選填</option>
        </select>
        <h6>選項：</h6>
        <input type="text" v-model="propsObj.option" placeholder="多個答案以；分隔" name="options" required>

        <button type="button" class="cancelEditBtn" @click="cancelEdit">取消編輯</button>
        <button type="button" class="updateBtn" @click="updateQuestionnaire">更新問卷</button>
    </div> -->

    <div class="confirmBtnArea" v-if="showQuestionsTab">
        <button type="button" @click="createQuestionAndSubmitToDb">儲存題目</button>
    </div>
</template>

<style lang="scss">
.bgArea {
    width: 100vw;
}

.topBtnArea {
    width: 70vw;
    height: 15vh;
    margin-left: 15vw;
    // margin-top: 10vh;
    display: flex;
    justify-content: center;
    align-items: center;
    // border: 1px solid black;

    button {
        width: 15vw;
        height: 50px;
        border-radius: 5px;
        border: 0;
        background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
        color: white;
        font-weight: bold;

        &:hover {
            font-size: 16pt;
        }
    }
}

.tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 10vw;
    margin: 2em auto;
    max-width: 70vw;
    width: 100%;

    input[type="radio"] {
        display: none;

        &:checked {
            +label {
                color: black;
                background-color: white;
                transform: translatey(1px);

                +.tab-content {
                    display: block;
                }
            }
        }
    }

    select {
        margin-left: 10px;
    }

    label {
        padding: 0.5em 0.75em;
        color: #ccc;
        border: 1px solid #ccc;
        border-bottom: unset;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        cursor: pointer;
        order: 0;

        &:hover {
            color: black;
        }
    }

    .tab-content {
        display: none;
        text-align: center;
        padding: 1em;
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 10px;
        order: 1;

        .tab1 {
            align-items: center;
            text-align: center;

            input {
                width: 20vw;
                height: 5vh;
                justify-content: center;
            }

            h6 {
                display: flex;
                flex-direction: column;
            }
        }

        .deleteBtn,
        .goBackBtn {
            width: 10vw;
            height: 5vh;
            border: 0;
            border-radius: 10px;
            margin-top: 5vh;
            margin-right: 3vw;
            background-color: #adadad;
            color: white;
            font-weight: bold;

            &:hover {
                font-size: 16pt;
            }
        }

        .addBtn,
        .submitBtn {
            width: 10vw;
            height: 5vh;
            border: 0;
            border-radius: 10px;
            background-color: #66b3ff;
            color: white;
            font-weight: bold;

            &:hover {
                font-size: 16pt;
            }
        }

        .addQnBtn {
            width: 15vw;
            height: 5vh;
            border: 0;
            border-radius: 10px;
            margin-top: 5vh;
            background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);
            // background-color: #B8B8DC;
            color: white;
            font-weight: bold;

            &:hover {
                font-size: 16pt;
            }
        }
    }

    .feedbackArea {
        width: 60vw;
        height: 30vh;
        text-align: center;
        margin-left: 5vw;
        margin-top: 5vh;
        background-color: #FFFFDF;
        overflow-y: auto;

        table {
            // 表格
            border-spacing: 0;
            width: 100%;
            // table-layout: auto;

        }

        th {
            // th：標題標籤 (h=head)
            padding: 10px;
            background-color: #EFFFD7;
        }

        td {
            // td：列標籤 (d=data)
            padding: 10px;
        }

        table tbody tr:nth-child(odd) {
            // 奇數列底色
            background-color: #ECFFFF;
        }

        .routeritem {
            text-decoration: none;
            color: black;
        }
    }
}

.addedQuestionsArea {
    width: 70vw;
    height: 41vh;
    text-align: center;
    margin-left: 15vw;
    // margin-top: 5vh;
    background-color: #ECFFFF;
    overflow-y: auto;
    // border: 1px solid black;

    table {
        // 表格
        border-spacing: 0;
        width: 100%;
    }

    th {
        // th：標題標籤 (h=head)
        padding: 10px;
        background-color: #F1E1FF;
    }

    td {
        // td：列標籤 (d=data)
        padding: 10px;

    }

    table tbody tr:nth-child(odd) {
        // 奇數列底色
        background-color: #FAF4FF
    }

    .routeritem {
        text-decoration: none;
        color: black;
    }

    button {
        border: 0;
        background-color: transparent;
    }
}

// .editArea {
//     width: 40vw;
//     height: 20vh;
//     text-align: center;
//     margin-left: 30vw;
//     border-radius: 10px;
//     background-color: #FFFFDF;
// }

.confirmBtnArea {
    width: 70vw;
    height: 15vh;
    margin-left: 15vw;
    // margin-top: 10vh;
    display: flex;
    justify-content: center;
    align-items: center;
    // border: 1px solid black;

    button {
        width: 15vw;
        height: 50px;
        border-radius: 5px;
        border: 0;
        background-image: linear-gradient(to right, #43e97b 0%, #38f9d7 100%);
        color: white;
        font-weight: bold;

        &:hover {
            font-size: 16pt;
        }
    }
}
</style>
