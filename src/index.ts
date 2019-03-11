class PyxCharts {
    constructor(private rootNode: HTMLElement) {
    }

    getSelector() {
        return this.rootNode
    }
}

const chart = new PyxCharts(document.querySelector(".draw_engine"))