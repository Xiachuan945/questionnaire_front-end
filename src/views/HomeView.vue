<script>
import { RouterLink, RouterView } from 'vue-router'
import Header from "../components/Header.vue"
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

            // 得到目前的日期
            nowday: new Date().toISOString().split('T')[0],

            // quId: null,
            qnId: null, //12.13
        }
    },
    mounted() {
        // 在頁面加載時獲取問卷列表(eclipse記得要先打開，執行後才會跑出來，不然會get不到後端資料)
        this.fetchAllQuestionnaire();
    },
    methods: {
        setPage(page) {
            if (page <= 0 || page > this.totalPage) {
                return
            }
            this.currentPage = page
        },
        // 進入前台頁時，自動顯示
        fetchAllQuestionnaire() {
            fetch("http://localhost:8080/api/quiz/searchQuestionnaireList")
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
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
        // 依照條件搜尋問卷
        searchAllQn() {
            // fetch("http://localhost:8080/api/quiz/searchQuestionnaireList?title" + this.searchTitle + "&startDate" + this.startDate + "&endDate" + this.endDate)
            const url = `http://localhost:8080/api/quiz/searchQuestionnaireList?title=${this.searchTitle}&startDate=${this.searchStartDate}&endDate=${this.searchEndDate}`;
            fetch(url)
                // 將API回應轉換為JSON格式
                .then(res => res.json())
                .then(data => {
                    this.allQuestionnaire = data.questionnaireList.map(questionnaire => {
                        // 計算狀態
                        const status = this.calculateStatus(questionnaire.startDate, questionnaire.endDate);
                        return { ...questionnaire, status };
                    }).reverse();
                })
                .catch(error => {
                    console.error("Error:", error);
                });
        },
        // 點選問卷去投票
        gotovote(status, index) {
            if (status === '開放中') {
                // this.quId = this.allQuestionnaire[index].quId; // 設置 quId
                // this.$router.push({ name: 'VoteSurvey', params: { quId: this.quId } });
                this.qnId = this.allQuestionnaire[index].qnId; // 設置 qnId 12.13
                this.$router.push({ name: 'VoteSurvey', params: { qnId: this.qnId } });  // 12.13
            } else {
                console.log(`問卷狀態：${status}`);
            }
        },
        // 依時間計算問卷狀態
        calculateStatus(startDate, endDate) {
            const now = new Date().toISOString().split('T')[0];
            if (now < startDate) {
                return '未開始';
            } else if (now >= startDate && now <= endDate) {
                return '開放中';
            } else {
                return '已結束';
            }
        },
        // 查看統計圖表        
        gotoGraphSurvey(index) {
            this.qnId = this.allQuestionnaire[index].qnId;
            this.$router.push({ name: 'GraphSurvey', params: { qnId: this.qnId } });
        }
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
    components: {
        Header,
        // RouterLink,
        // RouterView,
    }
}
</script>

<template>
    <div class="bgArea">

        <div class="srchArea">
            <div class="title">
                <label for="">問卷搜尋</label>
                <input type="search" v-model="searchTitle" placeholder="Enter your title">
            </div>
            <div class="timeSrch">
                <label for="">開始/結束</label>
                <input type="date" class="form-control" v-model="searchStartDate" id="startDate" name="startDate">
                <label for="">到</label>
                <input type="date" class="form-control" v-model="searchEndDate" id="endDate" name="endDate">
                <button type="button" @click="searchAllQn">搜尋</button>
            </div>
        </div>

        <div class="qtnrArea">
            <table>
                <thead>
                    <th>問卷編號</th>
                    <th>問卷名稱</th>
                    <th>問卷狀態</th>
                    <th>開始時間</th>
                    <th>結束時間</th>
                    <th>統計數據</th>
                </thead>

                <tbody>
                    <tr v-for="item, index in allQuestionnaire.slice(pageStart, pageEnd)" :key="index">
                        <td>{{ item.id }}</td>

                        <RouterLink class="routeritem"
                            :to="item.status === '開放中' ? '/VoteSurvey/' + JSON.stringify(item) : '#'">
                            <td @click="gotovote(item.status, index)">
                                <a href="#" style="text-decoration:none">{{ item.title }}</a>
                            </td>
                        </RouterLink>
                        
                        <td>
                            <span v-if="item.status === '未開始'" style="color: red ; font-weight: bold;">未開放</span>
                            <span v-else>{{ item.status }}</span>
                        </td>
                        <td>{{ item.startDate }}</td>
                        <td>{{ item.endDate }}</td>

                        <RouterLink class="routeritem" :to="item.status === '未開始' ? '#' : '/GraphSurvey/' + item.id">
                            <td v-if="item.status === '未開始'" style="color: red; font-weight: bold;">尚無數據</td>
                            <td v-else @click="gotoGraphSurvey(index)"><a href="#">查看</a></td>
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

        <div class="switch">
            <RouterLink class="routeritem" to="QuestionnaireList">
                <i class="fa-regular fa-pen-to-square"></i>
            </RouterLink>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.bgArea {
    width: 100vw;
}

.srchArea {
    width: 80vw;
    height: 30vh;
    margin-left: 10vw;
    margin-top: 10vh;
    background-color: #FFFFDF;

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
            background-color: #FFB5B5;
            color: white;
            font-size: large;
            font-weight: bold;
        }
    }
}

.qtnrArea {
    width: 80vw;
    height: 41vh;
    text-align: center;
    margin-left: 10vw;
    margin-top: 5vh;
    background-color: #DFFFDF;
    // border: 1px solid black;

    table {
        // 表格
        border-spacing: 0;
        width: 100%;
    }

    th {
        // th：標題標籤 (h=head)
        padding: 10px;
        background-color: #D9FFFF;
    }

    td {
        // td：列標籤 (d=data)
        padding: 10px;

    }

    table tbody tr:nth-child(odd) {
        // 奇數列底色
        background-color: #F0F0F0
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

.switch {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 50px;


    .fa-regular {
        font-size: 20pt;
        margin-bottom: 20px;

        &:hover {
            font-size: 30pt;
            color: gold;
        }
    }
}
</style>
