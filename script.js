let itemData = [];
let selectedKind = "";

document.addEventListener('DOMContentLoaded', async () => {
  const kindSelect = document.getElementById('itemKindSelect');
  const itemSelect = document.getElementById('itemSelect');
  const optionsContainer = document.getElementById('optionsContainer');

  const res = await fetch(API_CONFIG.ItemKinds);
  const data = await res.json();
  data.kinds.forEach(kind => {
    const option = document.createElement('option');
    option.value = kind.key;
    option.textContent = kind.name.name;
    kindSelect.appendChild(option);
  });

  kindSelect.addEventListener('change', async () => {
    selectedKind = kindSelect.value;
    const itemRes = await fetch(API_CONFIG.ItemList, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: selectedKind })
    });
    const itemDataRes = await itemRes.json();
    itemData = itemDataRes.items || [];

    itemSelect.innerHTML = '';
    itemData.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.korName || item.koKR || item.name;
      itemSelect.appendChild(option);
    });

    if(itemData.length > 0){
      showItemOptions(itemData[0], selectedKind);
    } else {
      optionsContainer.innerHTML = '';
      document.getElementById('itemImage').hidden = true;
    }
  });

  itemSelect.addEventListener('change', () => {
    const selectedItem = itemData.find(i => i.id == itemSelect.value);
    showItemOptions(selectedItem, selectedKind);
  });

  document.getElementById('generateBtn').addEventListener('click', async () => {
    const selectedItem = itemData.find(i => i.id == itemSelect.value);
    const optionInputs = document.querySelectorAll('.option-group, #materialOptionInputs');
    const options = [];

    optionInputs.forEach(el => {
      const key = el.dataset.key || null;
      const minInput = el.querySelector('.min');
      const maxInput = el.querySelector('.max');
      const min = minInput ? minInput.value : '';
      const max = maxInput ? maxInput.value : '';

      if (min || max) {
        options.push({ key, min, max });
      }
    });

    // ⚠️ 추가: 필터 요소 값 가져오기
    const ladder = document.getElementById('ladderSelect').value === 'true';
    const mode = document.getElementById('modeSelect').value;
    const ethereal = document.getElementById('etherealCheck').checked;

    //const rarityOptions = Array.from(document.getElementById('raritySelect').selectedOptions).map(opt => opt.value);

    // ⚠️ payload 확장
    const payload = {
      ItemKinds: selectedKind,
      ItemKey: selectedItem.id,
      Options: options.map(opt => ({
        key: Number(opt.key),
        min: opt.min ? Number(opt.min) : null,
        max: opt.max ? Number(opt.max) : null,
      })),
      prop_Ladder: ladder,
      prop_Mode: mode,
      prop_Ethereal: ethereal,
      //prop_Rarity: rarityOptions,
    };

    console.log(payload);

    const res = await fetch(API_CONFIG.MakeTraderieUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    document.getElementById('resultBox').style.display = 'block';
    document.getElementById('resUrl').textContent = json.real_url;
    //document.getElementById('resDate').textContent = json.LastResisDate;
	document.getElementById('resDate').textContent = json.base_url;
    document.getElementById('resPrice').textContent = json.LowPrice;
    document.getElementById('resPriceDate').textContent = json.LowPriceDate;
  });
});

function showItemOptions(item, kind) {
  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';

  const image = document.getElementById('itemImage');
  if (item && item.imageUrl) {
    image.src = item.imageUrl;
    image.hidden = false;
  } else {
    image.hidden = true;
  }

  if (kind === 'unique' && item && Array.isArray(item.description_filtered) && item.description_filtered.length > 0) {
    item.description_filtered.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'option-group';
      div.dataset.key = opt.property_id;

      div.innerHTML = `
        <label>${opt.property_kor}</label><br>
        min: <input type="number" class="min" value="${opt.min ?? ''}"> 
        max: <input type="number" class="max" value="${opt.max ?? ''}">
      `;
      container.appendChild(div);
    });
  } else if (kind === 'material') {
    //재료베이스 크롤링필요
  } else {
    // 옵션이 없으면 비워두기
  }
}
