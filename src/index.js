const launch = () => {
    localStorage.setItem("save", "aaaaa");
    window.mtlauncher.launch();
}

const change_sdk = async () => {
    const renpypath = await window.mtlauncher.openFileDialog("Ren'Py SDKのフォルダを選択してください。");
    window.mtlauncher.storeSet("renpy", renpypath);
    location.reload();
}

const change_project = async () => {
    const gamepath = await window.mtlauncher.openFileDialog("ゲームのフォルダを選択してください。");
    window.mtlauncher.storeSet("game", gamepath);
    location.reload();
}

const about = () => {
    location.href = "https://github.com/mttldev/MTLauncher";
}

const changeBranch = async () => {
    const branch = await window.mtlauncher.currectBranch();
    window.mtlauncher.showPrompt({
        title: "ブランチを変更",
        label: "ブランチ名を入力してください。",
        value: branch,
        inputAttrs: {
            type: "text"
        },
        type: "input"
    }).then(async (r) => {
        if (r == null) return;
        await window.mtlauncher.changeBranch(r);
        location.reload();
    });
}

window.onload = (async () => {
    const main_container = document.getElementById("main_container");
    if (window.mtlauncher.storeGet("renpy") == null) {
        alert("Ren'Py SDKのフォルダが設定されていません。\n選択してください。");
        const renpypath = await window.mtlauncher.openFileDialog("Ren'Py SDKのフォルダを選択してください。");
        window.mtlauncher.storeSet("renpy", renpypath);
    }
    if (window.mtlauncher.storeGet("game") == null) {
        alert("ゲームのフォルダが設定されていません。\n選択してください。");
        const gamepath = await window.mtlauncher.openFileDialog("ゲームのフォルダを選択してください。");
        window.mtlauncher.storeSet("game", gamepath);
    }
    try {
        const data = window.mtlauncher.fs.readFileSync(window.mtlauncher.path.join(window.mtlauncher.storeGet("game"), "game/saves/navigation.json"), "utf-8");
        const { name, version, error } = JSON.parse(data);
        main_container.innerHTML = `
            <h1>${name}</h1>
            <h3>Version: ${version}</h3>
            <h3>Branch: ${await window.mtlauncher.currectBranch()}</h3>
            ${error ? "<div class='error'>最後の起動時にエラーが発生していました。</div>" : ""}
        `;
    } catch (e) {
        main_container.innerHTML = `
            <h1>${window.mtlauncher.storeGet("game").split("/").slice(-1)[0].split("\\").slice(-1)[0]}</h1>
            このRen'Pyゲームの情報を取得するには、1回ゲームを起動してください。
        `;
    }
    main_container.innerHTML += `
    <div id="launch_pad">
        <div onclick="window.mtlauncher.deleteCompiled()" class="pad_button">コンパイル済みを削除</div>
        <div onclick="changeBranch()" class="pad_button">ブランチを変更</div>
        <div onclick="launch()" class="pad_button large_button">起動</div>
    </div>
    <div id="config_pad">
        <div onclick="about()" class="pad_button">MTLauncher</div>
        <div onclick="change_sdk()" class="pad_button">SDK変更</div>
        <div onclick="change_project()" class="pad_button">プロジェクト変更</div>
        <div onclick="location.reload()" class="pad_button">更新</div>
    </div>
    `;
});
