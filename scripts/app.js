'use strict'

let habbits = [];

const HABBITS_KEY = 'HABBITS_KEY';

let globalActiveHabbitId;

const domElemnt = 
{
    menu: document.querySelector('.menu__list'),
    header: 
    {
        titleName: document.querySelector('.header__title'),
        titleProgress: document.querySelector('.progress__text-num'),
        coverBar: document.querySelector('.progress__cover-bar')
    },
    main:
    {
        content: document.querySelector('.main__content'),
        formDay: document.querySelector('.habbit__day')
    },
    popup:
    {
        cover: document.querySelector('.cover'),
        popupHabbit: document.querySelector('.popup'),
        iconField: document.querySelector('.form input[name=icon]')
    }
}

/* Data */

function loadData()
{
    const parseKey = JSON.parse(localStorage.getItem(HABBITS_KEY));

    if (Array.isArray(parseKey))
    {
        habbits = parseKey;
    }

}



function saveData()
{
    localStorage.setItem(HABBITS_KEY, JSON.stringify(habbits));
}



/* Render */

function renderMenu(habbitMenu)
{


    for (let habbit of habbits)
    {
        const btnMenu = document.querySelector(`[menu-id="${habbit.id}"]`)

        if (!btnMenu)
        {
            const element = document.createElement('button');
            element.classList.add('menu__item');
            element.setAttribute("menu-id", habbit.id);
            element.addEventListener('click', () => reRender(habbit.id))
            element.innerHTML = `<img class="menu__habbit" src="./images/icons/${habbit.icon}.svg" alt="${habbit.name}"></img>`
            if (habbitMenu.id === habbit.id)
            {
                element.classList.add('menu__item_active');
            }

            domElemnt.menu.append(element);
            continue;
        }

        if (habbit.id === habbitMenu.id)
        {
            btnMenu.classList.add('menu__item_active');
        }
        else
        {
            btnMenu.classList.remove('menu__item_active');
        }
    }
}



function reRenderHeader(activeHabbit)
{

    domElemnt.header.titleName.textContent = activeHabbit.name;

    const progress = activeHabbit.day.length / activeHabbit.target > 1
                    ? 100
                    : Math.round(activeHabbit.day.length / activeHabbit.target * 100);


    domElemnt.header.titleProgress.textContent = progress + '%';
    domElemnt.header.coverBar.style.width = progress + '%';
}


function reRenderDay(activeHabbit)
{ 

    domElemnt.main.content.innerHTML = '';
    
    for (let index in activeHabbit.day)
    {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML =
        `
        <div class="habbit__day">
            День ${Number(index) + 1}
        </div>
        <div class="habbit__desc">
            ${activeHabbit.day[index].message}
        </div>
        <button class="habbit__del" onclick="removeTargrt(${index})">
            <img class="habbit__del-img" src="./images/delete.svg" alt="delete day">
        </button>
        `;
        
        domElemnt.main.content.append(element);
    }

    domElemnt.main.formDay.innerHTML = 'День' + ' ' + (activeHabbit.day.length + 1)
}



function reRender(activeHabbitId)
{
    globalActiveHabbitId = activeHabbitId;
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    if (!activeHabbit)
    {
        return;
    }
    document.location.replace(document.location.pathname + '#' + activeHabbit.id);
    renderMenu(activeHabbit);
    reRenderHeader(activeHabbit);
    reRenderDay(activeHabbit);
}


/* Get Form Data */

function newMessage(event)
{
    event.preventDefault();

    const data = validateForm(event.target, ['message']);
    if (!data)
    {
        return;
    }

    habbits = habbits.map(habbit =>
        {
            if (habbit.id === globalActiveHabbitId)
            {
                return {
                    ...habbit,
                    day: habbit.day.concat([{ message: data.message }])
                }
            }
            return habbit;
        })

    resetForm(event.target, ['message']);
    reRender(globalActiveHabbitId);
    saveData();

}


function removeTargrt(index)
{
    habbits = habbits.map(habbit =>
        {
            if (habbit.id === globalActiveHabbitId)
            {
                habbit.day.splice(index, 1);
                return {
                    ...habbit,
                    day: habbit.day
                }
            }
            return habbit;
        })
        
    reRender(globalActiveHabbitId);
    saveData();
    
}

function resetForm(form, fields)
{
    for (let field of fields)
    {
        form[field].value = '';
    }
}

function togglePopup()
{
    if (domElemnt.popup.cover.classList.contains('cover__habbit') && domElemnt.popup.popupHabbit.classList.contains('popup__habbit'))
    {
        domElemnt.popup.cover.classList.remove('cover__habbit');
        domElemnt.popup.popupHabbit.classList.remove('popup__habbit');
    }
    else
    {
        domElemnt.popup.cover.classList.add('cover__habbit');
        domElemnt.popup.popupHabbit.classList.add('popup__habbit');
    }
}

function setIcon(context, icon)
{
    domElemnt.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icon__btn.icon__active');
    activeIcon.classList.remove('icon__active');
    context.classList.add('icon__active');
}

function validateForm(form, fields)
{
    const formData = new FormData(form);
    const res = {};


    for (let field of fields)
    {
        let fieldValue = formData.get(field);

        
        form[field].addEventListener('input', () => 
        {
            if (form[field]) form[field].classList.remove('error');
        })
        if (!fieldValue)
        {
            form[field].classList.add('error');
        }
        res[field] = fieldValue;
    }
    let isValid = true;
    for (let field of fields)
    {
        if (!res[field])
        {
            isValid = false;
        }
    }
    if (!isValid)
    {
        return;
    }
    return res;
}

function addHabbits(event)
{
    event.preventDefault();

    const data = validateForm(event.target, ['name', 'icon', 'target']);
    if (!data)
    {
        return;
    }

    const maxID = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);

    habbits.push({
        id: maxID + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        day: []
    })

    resetForm(event.target, ['name', 'target']);
    togglePopup();
    saveData();
    reRender(maxID + 1);
}


(() =>
{
    loadData();
    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabbit = habbits.find(habbit => habbit.id == hashId);

    if (urlHabbit)
    {
        reRender(urlHabbit.id);
    }
    else
    {
        reRender(habbits[0].id);
    }
})()