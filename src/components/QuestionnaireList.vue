<script>
import { RouterLink, RouterView } from 'vue-router'
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            // 問卷總表
            allQuestionnaire: [],
            // 問卷分頁
            perpage: 6,  // 一頁的資料數
            currentPage: 1,
            // 搜尋標題
            searchTitle: "",
            searchStartDate: "",
            searchEndDate: "",
            // checkbox 全選/全不選的屬性
            isCheckedAll: false,
            nowday: new Date(), // 增加 nowday，用來比較

            //設立空陣列,將找到的資料放進去
            searchquestionnaire: [],    
        }
    },
    components: {
        RouterLink,
        RouterView,
    },
    mounted() {
        this.fetchAllQuestionnaire();
    },
    methods: {
        setPage(page) {
            if (page <= 0 || page > this.totalPage) {
                return
            }
            this.currentPage = page
        },
        // 1.進入後台頁時，自動顯示 2.資料刪除後，重新加載問卷資料        
        fetchAllQuestionnaire() {
            fetch("http://localhost:8080/api/quiz/searchQuestionnaireList")
                .then((res) => res.json())
                .then((data) => {
                    //將資料庫的資料放入空陣列
                    this.searchquestionnaire = data;
                    //因資料放在quizVoList裡面,所以要往下找一層才能拿到問卷
                    this.searchquestionnaire = this.searchquestionnaire.quizVoList
                    console.log(this.searchquestionnaire)

                    // 將API回應的JSON數據設置到組件的responseData數據屬性中
                    this.allQuestionnaire = data.questionnaireList.reverse().map(questionnaire => {
                        // 計算狀態
                        const status = this.calculateStatus(questionnaire.startDate, questionnaire.endDate);
                        return { ...questionnaire, status };
                    });
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        },
        // 問卷搜尋
        searchAllQn() {
            fetch("http://localhost:8080/api/quiz/searchQuestionnaireList?title" + this.searchTitle + "&startDate" + this.startDate + "&endDate" + this.endDate)
                // 將API回應轉換為JSON格式
                .then(res => res.json())
                .then(data => {
                    // 將API回應的JSON數據設置到組件的responseData數據屬性中
                    this.allQuestionnaire = data.questionnaireList.map(questionnaire => {
                        // 計算狀態
                        const status = this.calculateStatus(questionnaire.startDate, questionnaire.endDate);
                        return { ...questionnaire, status };
                    }).reverse();
                });
        },
        // 刪除問卷 (PS：DB的資料要記得為 0:未出版 才可以刪除喔！)        
        deleteQuestionnaire() {
            // 獲取選中的問卷 ID
            const selectedQnIds = this.allQuestionnaire
                .filter((item) => item.isChecked)
                .map((item) => item.id);

            // 檢查是否有選擇問卷
            if (selectedQnIds.length === 0) {
                // 如果沒有選擇問卷，顯示提示或執行其他操作
                Swal.fire({
                    icon: "warning",
                    title: "請選擇要刪除的問卷！",
                });
                return;
            }

            // 發送刪除問卷的請求
            fetch("http://localhost:8080/api/quiz/deleteQuestionnaire", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ qnList: selectedQnIds }), // 將選中的問卷 ID 發送到後端
            })
                .then((res) => res.json())
                .then((data) => {
                    // 處理後端返回的響應，根據需要執行操作
                    console.log(data);
                    Swal.fire({
                        icon: "success",
                        title: "資料成功刪除！",
                    });

                    // 重新加載問卷資料
                    this.fetchAllQuestionnaire();

                })
                .catch((error) => {
                    // 處理錯誤，例如顯示錯誤訊息
                    console.error("Error:", error);
                });
        },
        handleCheckboxChange() {
            this.isCheckedAll = this.allQuestionnaire.every(item => item.isChecked);
        },
        calculateStatus(startDate, endDate) {
            const now = new Date();
            if (now < startDate) {
                return '未開始';
            } else if (now >= startDate && now <= endDate) {
                return '進行中';
            } else {
                return '已結束';
            }
        },
    },
    computed: {
        totalPage() {
            return Math.ceil(this.allQuestionnaire.length / this.perpage)
            //Math.ceil()取最小整數
        },
        pageStart() {
            return (this.currentPage - 1) * this.perpage
            //取得該頁第一個值的index
        },
        pageEnd() {
            return this.currentPage * this.perpage
            //取得該頁最後一個值的index
        }
    },
}
</script>

<template>
    <div class="bgArea">

        <div class="srchArea">
            <div class="title">
                <label for="">問卷名稱</label>
                <input type="search" v-model="searchTitle" placeholder="Enter your title">
            </div>
            <div class="timeSrch">
                <label for="">統計時間</label>
                <input type="date" class="form-control" v-model="searchStartDate" id="date" name="date">
                <label for="">到</label>
                <input type="date" class="form-control" v-model="searchEndDate" id="date" name="date">
                <button type="button" @click="searchAllQn">搜尋</button>
            </div>
        </div>

        <div class="functionArea">
            <button @click="deleteQuestionnaire" style="border: none;background-color: white;">
                <i class="fa-solid fa-trash-can"></i>
            </button>
            <RouterLink class="routeritem" to="AddQuestionList">
                <i class="fa-solid fa-plus"></i>
            </RouterLink>
        </div>

        <div class="qtnrArea">
            <table>
                <thead>
                    <th>
                        <!-- 使用全選的狀態決定 checkbox 的選取狀態 -->
                        <input type="checkbox" v-model="isCheckedAll">
                    </th>
                    <th>編號</th>
                    <th>名稱</th>
                    <th>狀態</th>
                    <th>開始時間</th>
                    <th>結束時間</th>
                    <th>結果</th>
                </thead>

                <tbody>
                    <tr v-for="item, index in allQuestionnaire.slice(pageStart, pageEnd)" :key="index">
                        <td>
                            <input type="checkbox" v-model="item.isChecked" @change="handleCheckboxChange">
                        </td>
                        <td>{{ item.id }}</td>
                        <RouterLink class="routeritem" :to="item.status === '未開始' ? null : '/VoteSurvey/' + JSON.stringify(item)">
                            <td :class="{ 'notStarted': item.status === '未開始' }"
                                @click="item.status !== '未開始' && gotovote(index)">
                                <a href="#">{{ item.title }}</a>
                            </td>
                        </RouterLink>
                        <td :class="{ 'notStarted': item.status === '未開始' }">{{ item.status }}</td>
                        <td>{{ item.startDate }}</td>
                        <td>{{ item.endDate }}</td>
                        <RouterLink class="routeritem" :to="item.status === '未開始' ? null : 'GraphSurvey'">
                            <td :class="{ 'notStarted': item.status === '未開始' }"
                                @click="item.status !== '未開始' && goGraphSurvey(index)">
                                <a href="#">{{ item.status === '未開始' ? '尚無數據' : '查看' }}</a>
                            </td>
                        </RouterLink>
                    </tr>
                </tbody>

            </table>
        </div>

        <div class="pagechangeArea">
            <ul class="pagination">
                <li class="page-item" @click.prevent="setPage(currentPage - 1)">
                    <a class="page-link" href="#" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                <li class="page-item" :class="{ 'active': (currentPage === (n)) }" v-for="(n, index) in totalPage"
                    :key="index" @click.prevent="setPage(n)">
                    <a class="page-link" href="#">{{ n }}</a>
                </li>
                <li class="page-item" @click.prevent="setPage(currentPage + 1)">
                    <a class="page-link" href="#" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </div>

    </div>
</template>

<style lang="scss">
.bgArea {
    width: 100vw;
}

.srchArea {
    width: 80vw;
    height: 30vh;
    margin-left: 10vw;
    margin-top: 10vh;
    background-color: #FFD2D2;

    .title {
        height: 15vh;
        display: flex;
        justify-content: space-around;
        align-items: center;
        // border: 1px solid black;

        label {
            font-size: 20pt;
            font-weight: bold;
        }

        input {
            width: 40vw;
            height: 8vh;
            text-align: center;
            border: 0;
            border-radius: 10px;
        }
    }

    .timeSrch {
        height: 15vh;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        // border: 1px solid black;

        label {
            font-size: 20pt;
            font-weight: bold;
        }

        input {
            width: 20vw;
            height: 5vh;
            text-align: center;
            border: 0;
            border-radius: 10px;
        }
    }

    button {
        width: 10vw;
        height: 5vh;
        margin-left: 20px;
        border: none;
        border-radius: 10px;

        &:hover {
            background-color: #FFFFCE;
            color: purple;
            font-size: large;
            font-weight: bold;
        }
    }
}

.functionArea {
    width: 10vw;
    height: 6vh;
    // border: 1px solid black;
    margin-left: 10vw;
    margin-top: 5vh;
    display: flex;
    justify-content: space-around;

    .fa-solid {
        font-size: 30pt;
        color: #B87070;
    }
}

.qtnrArea {
    width: 80vw;
    height: 41vh;
    text-align: center;
    margin-left: 10vw;
    margin-top: 5vh;
    background-color: #FFEEDD;
    // border: 1px solid black;

    table {
        // 表格
        border-spacing: 0;
        width: 100%;
    }

    th {
        // th：標題標籤 (h=head)
        padding: 10px;
        background-color: #FFF8D7;
    }

    td {
        // td：列標籤 (d=data)
        padding: 10px;

    }

    table tbody tr:nth-child(odd) {
        // 奇數列底色
        background-color: #FFFFDF
    }

    .routeritem {
        text-decoration: none;
        color: black;
    }
}

.pagechangeArea {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 5vh;
}
</style>