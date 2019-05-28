function init() {
    window.addEventListener('DOMContentLoaded', (event) => {
        let menuDiv = document.getElementById("loginDiv");
        let firstRow = document.createElement("div");
        firstRow.setAttribute("class", "row")
        menuDiv.appendChild(firstRow);

        let firstCol = document.createElement("div");
        firstCol.setAttribute("class", "col");
        firstRow.appendChild(firstCol);

        let userNameInput = document.createElement("input");
        userNameInput.setAttribute("placeholder", "Enter username");
        userNameInput.setAttribute("id", "playerName");
        userNameInput.style.height = "38px";
        userNameInput.style.borderRadius = "5px";
        userNameInput.style.textAlign = "center";
        firstCol.appendChild(userNameInput);
        userNameInput.addEventListener("blur", function(){
            if (userNameInput.value === "") {
                userNameErrorText.style.display = "";
            } else {
                userNameErrorText.style.display = "none";
            }
        })

        let userNameErrorText = document.createElement("p");
        userNameErrorText.setAttribute("id", "userNameErrorText");
        userNameErrorText.style.textAlign = "center";
        userNameErrorText.style.display = "none";
        userNameErrorText.style.color = "red";
        userNameErrorText.innerHTML = "* Username is required";
        firstCol.appendChild(userNameErrorText);

        let secondRow = document.createElement("div");
        secondRow.setAttribute("class", "row");
        menuDiv.appendChild(secondRow);

        let secondCol = document.createElement("div");
        secondCol.setAttribute("class", "col");
        secondRow.append(secondCol);

        let colorSelect = document.createElement("select");
        colorSelect.setAttribute("class", "color-select");
        colorSelect.setAttribute("id", "colorSelect");
        colorSelect.style.height = "38px";
        colorSelect.style.borderRadius = "5px";

        let colorObject = [
            {
                value: "red",
                text: "Red"
            },
            {
                value: "green",
                text: "Green"
            },
            {
                value: "blue",
                text: "Blue"
            },
            {
                value: "white",
                text: "White"
            }
        ]

        colorObject.map((color) => {
            let colorOption = document.createElement("option");
            colorOption.setAttribute("value", color.value);
            colorOption.text = color.text;
            colorSelect.appendChild(colorOption);
        })

        secondCol.appendChild(colorSelect);
        secondRow.style.marginTop = "15px";

        let thirdRow = document.createElement("div");
        thirdRow.setAttribute("class", "row");

        let thirdCol = document.createElement("div");
        thirdCol.setAttribute("class", "col");

        let submitButton = document.createElement("button");
        submitButton.setAttribute("class", "btn btn-info");
        submitButton.setAttribute("id", "submitButton");
        submitButton.style.marginTop = "15px";
        submitButton.style.width = "178px";
        submitButton.innerHTML = "Submit";

        thirdCol.appendChild(submitButton);
        thirdRow.appendChild(thirdCol);
        menuDiv.appendChild(thirdRow);
    })


}


