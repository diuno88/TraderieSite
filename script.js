let itemData = [];
let selectedKind = "";

document.getElementById('itemSearchInput').addEventListener('input', () => {
  const keyword = document.getElementById('itemSearchInput').value.trim();
  const filtered = itemData.filter(item =>
    (item.korName || item.koKR || item.name || "").includes(keyword)
  );

  const itemSelect = document.getElementById('itemSelect');
  itemSelect.innerHTML = '';
  filtered.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.korName || item.koKR || item.name;
    itemSelect.appendChild(option);
  });

  if (filtered.length > 0) {
    showItemOptions(filtered[0], selectedKind);
  } else {
    document.getElementById('optionsContainer').innerHTML = '';
    document.getElementById('itemImage').hidden = true;
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const kindSelect = document.getElementById('itemKindSelect');
  const itemSelect = document.getElementById('itemSelect');
  const optionsContainer = document.getElementById('optionsContainer');
  const categoryWrapper = document.getElementById('categoryWrapper');
  const categorySelect = document.getElementById('categorySelect');

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
    if (['material', 'magic', 'rare'].includes(selectedKind)) {
      categoryWrapper.style.display = 'block';
//      const ctgRes = await fetch(`/categories?kind=${selectedKind}`);
      const ctgData = await itemRes.json();
      const ctgList = ctgData.categories || [];
      categorySelect.innerHTML = '';
      ctgList.forEach(ctg => {
        const opt = document.createElement('option');
        opt.value = ctg;
        opt.textContent = ctg;
        categorySelect.appendChild(opt);
      });
      if (ctgList.length > 0) {
        categorySelect.dispatchEvent(new Event('change'));
      }
    } else {
      categoryWrapper.style.display = 'none';
      const itemDataRes = await itemRes.json();
      itemData = itemDataRes.items || [];

      itemSelect.innerHTML = '';
      itemData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.korName || item.koKR || item.name;
        itemSelect.appendChild(option);
      });

      if (itemData.length > 0) {
        showItemOptions(itemData[0], selectedKind);
      } else {
        optionsContainer.innerHTML = '';
        document.getElementById('itemImage').hidden = true;
      }
    }
  });

  categorySelect.addEventListener('change', async () => {
    const ctg = categorySelect.value;
    const url = `${API_CONFIG.selectCategories}?kind=${encodeURIComponent(selectedKind)}&ctg=${encodeURIComponent(ctg)}`;
    const ctgRes = await fetch(url);
    const data = await ctgRes.json();

    itemData = data.items || [];
    itemSelect.innerHTML = '';
    itemData.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.name || item.korName || item.koKR;
      itemSelect.appendChild(option);
    });

    if (itemData.length > 0) {
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
});

document.getElementById('generateBtn').addEventListener('click', async () => {
  const selectedItem = itemData.find(i => i.id == itemSelect.value);
  if (!selectedItem) {
    alert("⚠ 아이템이 선택되지 않았습니다. 다시 선택해주세요.");
    return;
  }

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

  const ladder = document.getElementById('ladderSelect').value === 'true';
  const mode = document.getElementById('modeSelect').value;
  const ethereal = document.getElementById('etherealCheck').checked;

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
    prop_Ethereal: ethereal
  };

  const res = await fetch(API_CONFIG.MakeTraderieUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  document.getElementById('resultBox').style.display = 'block';

  const tableBody = document.querySelector('#listingTable tbody');
  tableBody.innerHTML = '';

  (json.listings || []).forEach((listing, index) => {
    const row = document.createElement('tr');

    const numCell = document.createElement('td');
    numCell.textContent = index + 1;

    const priceCell = document.createElement('td');
    priceCell.textContent = listing.price;

    const dateCell = document.createElement('td');
    dateCell.textContent = listing.updated_at;

    const linkCell = document.createElement('td');
    const link = document.createElement('a');
    link.href = `https://traderie.com/diablo2resurrected/listing/${listing.id}`;
    link.textContent = '확인';
    link.target = '_blank';
    link.style.color = '#1a73e8';

    linkCell.appendChild(link);

    row.appendChild(numCell);
    row.appendChild(priceCell);
    row.appendChild(dateCell);
    row.appendChild(linkCell);

    tableBody.appendChild(row);
  });
});

function showItemOptions(item, kind) {
  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';

  const image = document.getElementById('itemImage');
  if (item && item.img) {
    image.src = item.img;
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
    // 재료베이스 크롤링 필요
  } else {
    // 옵션이 없으면 비워두기
  }
}
