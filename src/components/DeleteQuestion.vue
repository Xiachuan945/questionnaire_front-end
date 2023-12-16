<script>

</script>

<template>
   
</template>

<style lang="scss">

</style>
<!-- <script>
export default {
    data() {
        return

    },
    components: {

    },
    methods: {
        deleQn() {
            //終止方法的可受變數
            let stopDel = false;
            // 後端需要的qnidList
            let data = [];
            //前端要的索引值
            let data1 = [];

            // 判斷我要去刪掉陣列問卷的哪幾個
            for (let i = 0; i < this.indexArr.length; i++) {
                let indexNum = 0;
                let bigNum = this.indexArr[i].currPage
                let smallNum = this.indexArr[i].index

                indexNum = this.perpage * (bigNum - 1) + smallNum
                data1.push(indexNum)
                data.push(this.allQuestionnaire[indexNum].id)
            }
            console.log(data1);

            //判斷這幾個裡面是否有已出版或在進行中的資料
            for (let w = 0; w < data1.length; w++) {
                const SSdate = new Date(this.allQuestionnaire[data1[w]].startDate);
                const NNdate = new Date(this.nowday);
                if (this.allQuestionnaire[data1[w]].published == true && NNdate >= SSdate) {
                    stopDel = true;
                    alert("刪除的問卷中，包含已開始的問卷，禁止刪除！");
                    return stopDel;
                }
            };
        }
    }
}
</script>

<template>
    <div class="delArea">
        <p>請選擇要刪除的問卷</p>
        <p>確定要刪除嗎？</p>
        <br>
    </div>
    <button type="button" class="confirmBtn" @click="deleQn">確定</button>
</template>

<style lang="scss">


.confirmBtn {
    width: 150px;
    height: 50px;
    border: 0;
    border-radius: 10px;
    background-color: #FF9D6F;
    color: white;
}
</style> -->