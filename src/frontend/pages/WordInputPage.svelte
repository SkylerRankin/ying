<script lang="ts">
    const testInputs: any[] = [
        {
            type: "word",
            pinyin: "asdasdasd",
            characters: "ajkldf",
            english: "450jf"
        },
        {
            type: "word",
            pinyin: "rrrrrasdasdasd",
            characters: "af",
            english: "450jf"
        },
        {
            type: "word",
            pinyin: "asd23asdasd",
            characters: "ajkldf",
            english: "x"
        }
    ];
</script>

<style>
    .inputTable {
        width: 100%;
    }

    .inputTable tr th {
        text-align: left;
    }

    .inputTable tr td textarea {
        width: 100%;
        border-radius: 10px;
        resize: none;
    }

    .inputContainer {
        border: solid 1px lightgray;
        border-radius: 10px;
        padding: 20px;
    }

</style>

<h1>Input words</h1>
<div class="inputContainer">
    <table class="inputTable">
        <tr>
            <th>Type</th>
            <th>Pinyin</th>
            <th>Characters</th>
            <th>English</th>
        </tr>
        <tr>
            <td>
                <select>
                    <option>Word</option>
                    <option>Phrase</option>
                    <option>Sentence</option>
                    <option>Grammar</option>
                </select>
            </td>
            <td>
                <textarea/>
            </td>
            <td>
                <textarea/>
            </td>
            <td>
                <textarea/>
            </td>
        </tr>
    </table>
    <button>Submit</button>
</div>
<div>
    
</div>


<hr/>
