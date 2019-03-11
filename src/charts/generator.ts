import { Chart } from "../interfaces/chart";
import { PyxChart } from "./chart";
import { PyxNode } from "../interfaces/node";

const generateBasicTemplate = (node: PyxNode) => {
    const rootNode = document.createElement(node.tag)
    if (node.id) {
        rootNode.setAttribute("id", node.id)
    }

    if (node.classList) {
        node.classList.forEach((item) => {
            rootNode.classList.add(item)
        })
    }

    if(node.children) {
        node.children.forEach((item) => {
            rootNode.appendChild(generateBasicTemplate(item))
        })
    }

    return rootNode
}

export function chartsGenerator(rootNode: HTMLElement): (dataset: Chart) => PyxChart {
    let id = 0;
    return (dataset: Chart) => {
        const basicNode = generateBasicTemplate({
            id: `pyx_chart_${id}`,
            classList: ["pyx_chart_container"],
            tag: "div",
            children: [
                {
                    tag: "svg"
                },
                {
                    tag: "svg"
                },
                {
                    tag: "div",
                    children: [
                        {
                            tag: "button"
                        },
                        {
                            tag: "button"
                        }
                    ]
                }
            ]
        })
        rootNode.appendChild(basicNode)
        id++
        return new PyxChart(id, basicNode, dataset)
    }
}