<script>
import Chart from 'chart.js/auto';

export default {
    data() {
        return {
            charts: [],
            ansCountByQId: [], // 每個qId都有一個對應的圖表 → ansCountByQId
            questionOptions: [],
            options: [],
            questionList: [],
            userData: [],
            userList: [],
        };
    },
    mounted() {
        // 取得作答資料
        this.getUserDataFromDb();
        // 取得問卷選項
        this.getQulistOptionsFromDb();

        // 異步方法 → 設置一個計時器，在設定後的特定時刻，觸發一個特定方法
        setTimeout(() => {
            this.createChart()
        }, 300);  // 毫秒
    },
    methods: {
        // 撈後端的填答資料，做為圖表的統計數據_y軸次數
        getUserDataFromDb() {
            const qnId = this.$route.params.qnId;
            this.qnId = qnId;

            fetch('http://localhost:8080/api/quiz/getUser?qnId=' + qnId, {
                method: "GET",
                headers: new Headers({
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                })
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);

                    // userData撈回來的是物件[Object]，需要裡面的 userList
                    this.userData = data
                    console.log(this.userData.userList);

                    const userList = this.userData.userList

                    // userList中撈回來的題目qId進行答案ans的分類計數
                    const ansCountByQId = [];

                    // 遍歷 userList 並累計 ans 值的次數
                    userList.forEach((user) => {
                        const qId = user.qId;
                        const ansValue = user.ans;

                        // 檢查是否已有相同 qId 的資料
                        const existingData = ansCountByQId.find(item => item.qId === qId);

                        if (existingData) {
                            // 如果存在，則更新該 qId 的 ansCounts
                            existingData.ansCounts[ansValue] = (existingData.ansCounts[ansValue] || 0) + 1;
                        } else {
                            // 如果不存在，則新增一個包含 qId 和 ansCounts 的物件
                            ansCountByQId.push({
                                qId: qId,
                                ansCounts: {
                                    [ansValue]: 1,
                                },
                            });
                        }
                    });

                    console.log("ansCountByQId:", ansCountByQId);
                    this.ansCountByQId = ansCountByQId;
                })
                .catch((error) => {
                    console.error("錯誤:", error);
                });
        },
        // 撈後端的問卷選項，作為圖表的統計數據_x軸呈現
        getQulistOptionsFromDb() {
            fetch('http://localhost:8080/api/quiz/searchQuestionList?qnId=' + this.qnId, {
                method: "GET",
                headers: new Headers({
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                })
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);

                    // questionOptions 撈回來的是[Object]，需要裡面的 questionList
                    this.questionOptions = data
                    console.log(this.questionOptions.questionList);

                    this.questionList = this.questionOptions.questionList

                    // 檢查 questionList 是否為陣列
                    if (Array.isArray(this.questionList)) {
                        // 使用 map 從 questionList 陣列中提取每個問題的 "option" 值
                        this.options = this.questionList.map(question => question.option);
                        console.log("options :", this.options);
                    } else {
                        console.error("錯誤：問題選項的資料格式無效");
                    }
                })
                .catch((error) => {
                    console.error("錯誤:", error);
                });
        },
        // 建立圖表 (根據後端傳回的問卷填答資料和問卷選項資料進行統計和顯示)
        createChart() {
            // 追蹤迴圈中當前處理的問卷的索引或序號
            var indexNum = 0

            // 遍歷 questionList，對於每一個問題創建一個 canvas 元素
            this.questionList.forEach(question => {
                const canvas = document.createElement("canvas");
                const questionTitle = document.createElement("p");
                questionTitle.textContent = question.quId + "、" + question.qTitle

                canvas.width = 800;
                canvas.height = 200;

                var name = [];
                var num = [];

                // 從 ansCountByQId 中獲取問題的填答次數資料，包括填答選項名稱和對應的次數
                name = Object.keys(this.ansCountByQId[indexNum].ansCounts);     // Object.keys：取得物件中的所有 property key，將 key 值以陣列的方式呈現
                num = Object.values(this.ansCountByQId[indexNum].ansCounts);    // Object.values：取得所有 property value，並以陣列回傳

                const canvasPlace = document.getElementById("canvasPlaceId");

                // 檢查是否成功創建了 canvas 元素
                if (canvas.getContext) {
                    const ctx = canvas.getContext('2d');

                    // 將canvas添加到創建的容器中
                    canvasPlace.appendChild(questionTitle);
                    canvasPlace.appendChild(canvas);

                    // 圖表數據
                    const data = {
                        labels: name,        // 圖表名稱分類是陣列 !
                        datasets: [{
                            data: num,
                            backgroundColor: ['#FFE66F', '#79FF79', '#84C1FF', '#CA8EFF', '#FF9D6F'],
                            // backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                        }],
                        hoverOffset: 4
                    };

                    // 圖表選項
                    const options = {
                    };

                    // 創建新的圖表視窗
                    new Chart(ctx, {
                        type: 'doughnut',  // 圖表類型：line(折線圖)、bar(長條圖)、pie(圓餅圖)、doughnut(餅圖_甜甜圈)
                        data: data,
                        options: options   // 圖表答案 → 選項是陣列
                    });
                } else {
                    // 瀏覽器不支援 Canvas
                    console.error("目前瀏覽器不支援Canvas！");
                }

                // 每次迭代後進行 indexNum++，以便在下一次迭代時處理下一個問卷的數據
                indexNum++
            });

        }
    }
}
</script>

<template>
    <div class="bgArea">

        <div class="titleArea">
            <h2 style="color: brown;"><strong>統計數據</strong></h2>
        </div>

        <div class="canvasArea">
            <!-- 每個題號 qId 都有一個對應的圖表 -->
            <div class="canvasPlace" id="canvasPlaceId" style="font-size: 16pt;font-weight: bold;">
            </div>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.bgArea {
    width: 100vw;
    background-color: #F0F0F0;

}

.titleArea {
    width: 100vw;
    height: 10vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 5vh;
    // margin-top: 5vh;
}

.canvasArea {
    width: 40vw;
    margin: 5vh auto;
    display: flex;
    flex-direction: column;
    text-align: center;
    // background-color: #F0F0F0;
}
</style>