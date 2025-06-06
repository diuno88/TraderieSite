// 📌 전역 변수
let itemData = [];
let selectedKind = "";
let selectedItems = [];
let selectedOptions = [];
let allOptionData = []; // ✅ 전체 옵션 저장

// API 주소 입력/저장 관리
const apiInput = document.getElementById('api-url-input');
const saveApiBtn = document.getElementById('save-api-url');
const resetApiBtn = document.getElementById('reset-api-url');
const API_KEY = 'API_BASE_URL';

function applyApiState() {
  const savedUrl = localStorage.getItem(API_KEY);
  if (savedUrl) {
    apiInput.value = savedUrl;
    apiInput.disabled = true;
    saveApiBtn.disabled = true;
    resetApiBtn.style.display = 'inline';
  } else {
    apiInput.disabled = false;
    saveApiBtn.disabled = false;
    resetApiBtn.style.display = 'none';
  }
  
}

function saveApiUrl() {
  const value = apiInput.value.trim();
  if (!value) {
    alert('API 주소를 입력해주세요.');
    return;
  }
  localStorage.setItem(API_KEY, value);
  applyApiState();
  location.reload();
}

function resetApiUrl() {
  localStorage.removeItem(API_KEY);
  apiInput.value = '';
  applyApiState();
  location.reload();
}

saveApiBtn.addEventListener('click', saveApiUrl);
resetApiBtn.addEventListener('click', resetApiUrl);

// 초기 상태 반영
applyApiState();


// 🔍 아이템 검색 입력
const itemSearchInput = document.getElementById('itemSearchInput');
itemSearchInput.addEventListener('input', () => {
  const keyword = itemSearchInput.value.trim();
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
  
  const optionsContainer = document.getElementById('optionsContainer'); // ✅ container 정의
  
  if (filtered.length > 0) {
	if (selectedKind === 'unique') {
	  const notice = document.createElement('p');
	  notice.textContent = '🛈 옵션을 제외하고 싶을 땐 빈값을 입력하세요';
	  notice.style.color = 'gray';
	  notice.style.marginBottom = '8px';
	  optionsContainer.appendChild(notice);
	}  
    showItemOptions(filtered[0], selectedKind);
  } else {
    optionsContainer.innerHTML = '';
    document.getElementById('itemImage').hidden = true;
  }
});

// 초기 로딩

document.addEventListener('DOMContentLoaded', async () => {
  const kindSelect = document.getElementById('itemKindSelect');
  const itemSelect = document.getElementById('itemSelect');
  const optionsContainer = document.getElementById('optionsContainer');
  const categoryWrapper = document.getElementById('categoryWrapper');
  const categorySelect = document.getElementById('categorySelect');
  const optionCombo = document.getElementById('optionCombo');
  const optionSearchInput= document.getElementById('optionSearchInput');
  const wrapper = document.getElementById("youtubeIframeWrapper");
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '- 선택하세요 -';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  kindSelect.appendChild(defaultOption);

  const res = await fetch(API_CONFIG.ItemKinds);
  const data = await res.json();
  data.kinds.forEach(kind => {
    const option = document.createElement('option');
    option.value = kind.key;
    option.textContent = kind.name.name;
    kindSelect.appendChild(option);
  });
   try {  
   const randomVideo = data.random_video;
  //✅ random_video 처리
  if (randomVideo && randomVideo.videoId) {
	  const iframe = createYouTubeIframe(randomVideo.videoId, randomVideo.title);
	  wrapper.appendChild(iframe);
  }
	// ✅ fallback: 랜덤 영상이 없거나 iframe이 추가되지 않은 경우
	if (wrapper.children.length === 0) {
	  const fallbackVideoId = "dQw4w9WgXcQ";  // 고정 영상 ID
	  const iframe = createYouTubeIframe(fallbackVideoId, "노랑홍당무 채널 대표 영상");
	  wrapper.appendChild(iframe);
}

// 🎯 기존 itemKinds 렌더링 등
renderItemKinds(data.itemKinds);


  } catch (error) {
    console.error("초기 데이터 로딩 실패:", error);
  }
  // 공통 iframe 생성 함수
  function createYouTubeIframe(videoId, title) {
    const iframe = document.createElement("iframe");
    iframe.width = "320";
    iframe.height = "180";
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = title || "YouTube video player";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    return iframe;
  }
 
  optionSearchInput.addEventListener('input', () => {
	const keyword = document.getElementById('optionSearchInput').value.trim();
	const filtered = allOptionData.filter(opt => {
		const text = formatOptionText(opt);
		return text.includes(keyword);
	});
	renderOptionCombo(filtered);
  });
  kindSelect.addEventListener('change', async () => {
    selectedKind = kindSelect.value;

    // 선택에 따라 UI 컨트롤 표시 여부 조절
    const showExtras = ['material', 'magic', 'rare'].includes(selectedKind);
    document.getElementById('selectedItemsWrapper').style.display = showExtras ? 'block' : 'none';
    document.getElementById('selectedOptionsWrapper').style.display = showExtras ? 'block' : 'none';
    document.getElementById('addItemBtn').style.display = showExtras ? 'inline-block' : 'none';
	document.getElementById('bulkControls').style.display = showExtras ? 'block' : 'none';

    if (showExtras) {
      selectedItems = [];
      selectedOptions = [];
      renderSelectedItems();
      renderSelectedOptions();
    }

    const itemRes = await fetch(API_CONFIG.ItemList, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: selectedKind })
    });

    if (showExtras) {
      categoryWrapper.style.display = 'block';
      const ctgData = await itemRes.json();
      const ctgList = ctgData.categories || [];
      optionCombo.style.display = 'inline-block';
      if (ctgData.options) loadOptionComboBox(ctgData.options);
      categorySelect.innerHTML = '';
      ctgList.forEach(ctg => {
        const opt = document.createElement('option');
        opt.value = ctg.id;
        opt.textContent = ctg.korName ? `${ctg.korName} (${ctg.id})` : ctg.id;
        categorySelect.appendChild(opt);
      });
      if (ctgList.length > 0) categorySelect.dispatchEvent(new Event('change'));
    } else {
      categoryWrapper.style.display = 'none';
      optionCombo.style.display = 'none';
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
      option.textContent = item.korName || item.koKR || item.name || item.id;
      itemSelect.appendChild(option);
    });
    if (itemData.length > 0) showItemOptions(itemData[0], selectedKind);
    else {
      optionsContainer.innerHTML = '';
      document.getElementById('itemImage').hidden = true;
    }
  });

  itemSelect.addEventListener('change', () => {
    const selectedItem = itemData.find(i => i.id == itemSelect.value);
    showItemOptions(selectedItem, selectedKind);
  });
  
  document.getElementById('resetBtn').addEventListener('click', () => {
	  // 1. 콤보박스 초기화
	  document.getElementById('itemKindSelect').value = '';
	  document.getElementById('categorySelect').innerHTML = '';
	  document.getElementById('itemSelect').innerHTML = '';
	  document.getElementById('optionCombo').innerHTML = '<option value="">옵션을 선택하세요</option>';
	  document.getElementById('optionCombo').style.display = 'none';

	  // 2. 검색 입력 초기화
	  document.getElementById('itemSearchInput').value = '';

	  // 3. 옵션/아이템 관련 영역 초기화 및 숨김
	  document.getElementById('optionsContainer').innerHTML = '';
	  document.getElementById('itemImage').hidden = true;
	  document.getElementById('addItemBtn').style.display = 'none';
	  document.getElementById('selectedItemsWrapper').style.display = 'none';
	  document.getElementById('selectedOptionsWrapper').style.display = 'none';
	  document.getElementById('itemList').innerHTML = '';
	  document.getElementById('optionList').innerHTML = '';

	  // 4. 상태 변수 초기화
	  selectedItems = [];
	  selectedOptions = [];
	  selectedKind = '';
	  itemData = [];

	  // 5. 결과 영역 초기화
	  document.getElementById('resultBox').style.display = 'none';
	  document.querySelector('#listingTable tbody').innerHTML = '';
	});

});


document.getElementById('bulkAddBtn').addEventListener('click', () => {
  const newlyAdded = itemData.filter(item =>
    !selectedItems.find(sel => sel.id === item.id)
  );
  selectedItems = selectedItems.concat(newlyAdded);
  renderSelectedItems();
});

document.getElementById('bulkRemoveBtn').addEventListener('click', () => {
  selectedItems = [];
  renderSelectedItems();
});

// 옵션 콤보박스 로딩
async function loadOptionComboBox(optionJson) {
  allOptionData = optionJson; // 원본 저장
  renderOptionCombo(allOptionData);
}
function renderOptionCombo(list) {
  const combo = document.getElementById('optionCombo');
  combo.innerHTML = '<option value="">옵션을 선택하세요</option>';
  list.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.id;
    option.textContent = formatOptionText(opt);
    combo.appendChild(option);
  });
}
function formatOptionText(opt) {
  if (!opt.koKR) return opt.name;
  return opt.koKR.replace(/%d/g, '10').replace(/%s/g, '스킬명').replace(/%%/g, '%');
}
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

  // 유니크 아이템에 한해 옵션 표시
  if (kind === 'unique' && Array.isArray(item.description_filtered)) {
    // 안내문구
    const notice = document.createElement('p');
    notice.textContent = '🛈 옵션을 제외하고 싶을 땐 빈값을 입력하세요';
    notice.style.color = 'gray';
    notice.style.marginBottom = '8px';
    container.appendChild(notice);

    item.description_filtered.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'option-group';
      div.dataset.key = opt.property_id;

      const label = document.createElement('label');
      label.textContent = opt.property_kor;

      const minInput = document.createElement('input');
      minInput.type = 'number';
      minInput.className = 'min';
      minInput.value = opt.min ?? '';
      minInput.style.margin = '0 6px';
      minInput.style.width = '60px';

      const maxInput = document.createElement('input');
      maxInput.type = 'number';
      maxInput.className = 'max';
      maxInput.value = opt.max ?? '';
      maxInput.style.margin = '0 6px';
      maxInput.style.width = '60px';

      const clearBtn = document.createElement('button');
      clearBtn.textContent = '삭제';
      clearBtn.addEventListener('click', () => {
        minInput.value = '';
        maxInput.value = '';
      });

      div.appendChild(label);
      div.appendChild(document.createTextNode(' min:'));
      div.appendChild(minInput);
      div.appendChild(document.createTextNode(' max:'));
      div.appendChild(maxInput);
      div.appendChild(clearBtn);

      container.appendChild(div);
    });
  }
}

// 옵션 표시
function showItemOptions_tmp(item, kind) {
  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  
  const image = document.getElementById('itemImage');
  if (item && item.img) {
    image.src = item.img;
    image.hidden = false;
  } else {
    image.hidden = true;
  }

  if (kind === 'unique' && Array.isArray(item.description_filtered)) {
    item.description_filtered.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'option-group';
      div.dataset.key = opt.property_id;
      div.innerHTML = `
        <label>${opt.property_kor}</label><br>
        min: <input type="number" class="min" value="${opt.min ?? ''}"> 
        max: <input type="number" class="max" value="${opt.max ?? ''}">
		<button type="button" class="clearBtn" data-idx="${idx}">삭제</button>
      `;
      container.appendChild(div);
    });
	// 삭제 버튼 이벤트: min/max 비우기
    // 삭제 버튼 생성 및 직접 이벤트 연결
    const btn = document.createElement('button');
    btn.textContent = '삭제';
    btn.className = 'clearBtn';
    btn.style.marginLeft = '8px';
    btn.addEventListener('click', () => {
      const minInput = div.querySelector('.min');
      const maxInput = div.querySelector('.max');
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';
    });

    div.appendChild(btn);
    container.appendChild(div);
	
  }
}

// 아이템 추가
const addItemBtn = document.getElementById('addItemBtn');
addItemBtn.addEventListener('click', () => {
  if (!['material', 'magic', 'rare'].includes(selectedKind)) return;
  const itemSelect = document.getElementById('itemSelect');
  const selectedItemId = itemSelect.value;
  const item = itemData.find(i => i.id == selectedItemId);
  if (!item || selectedItems.find(i => i.id === item.id)) return;
  selectedItems.push(item);
  renderSelectedItems();
});

function renderSelectedItems() {
  const list = document.getElementById('itemList');
  list.innerHTML = '';
  selectedItems.forEach((item, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${selectedKind} | ${item.korName || item.name}
      <img src="${item.img}" alt="" width="30" style="vertical-align:middle;">
      <button onclick="removeSelectedItem(${idx})">삭제</button>
    `;
    list.appendChild(li);
  });
}

function removeSelectedItem(index) {
  selectedItems.splice(index, 1);
  renderSelectedItems();
}

// 옵션 선택
const optionCombo = document.getElementById('optionCombo');

optionCombo.addEventListener('change', () => {
  if (!['material', 'magic', 'rare'].includes(selectedKind)) return;
  const selectedId = optionCombo.value;
  const selectedMeta = allOptionData.find(opt => opt.id == selectedId);
  if (!selectedId || selectedOptions.find(opt => opt.key == selectedId)) return;

  if (selectedMeta?.global) {
    selectedOptions.push({ key: selectedId, label: formatOptionText(selectedMeta), checked: false });
  } else {
    selectedOptions.push({ key: selectedId, min: '', max: '', label: formatOptionText(selectedMeta) });
  }
  renderSelectedOptions();
});

function renderSelectedOptions() {
  const list = document.getElementById('optionList');
  list.innerHTML = '';

  selectedOptions.forEach((opt, idx) => {
    const optionMeta = allOptionData.find(o => o.id == opt.key);
    const li = document.createElement('li');

    li.innerHTML = '';

    // 옵션명
    const label = document.createElement('span');
    label.textContent = opt.label;
    li.appendChild(label);

    if (optionMeta?.global) {
      // ✅ global 옵션은 체크박스 처리
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'global-checkbox';
      checkbox.style.marginLeft = '10px';
      checkbox.checked = !!opt.checked;

      const status = document.createElement('span');
      status.textContent = checkbox.checked ? '적용' : '미적용';
      status.style.marginLeft = '6px';

      checkbox.addEventListener('change', () => {
        opt.checked = checkbox.checked;
        status.textContent = checkbox.checked ? '적용' : '미적용';
      });

      li.appendChild(checkbox);
      li.appendChild(status);
    } else {
      // ✅ 일반 옵션은 min/max 입력
      const minInput = document.createElement('input');
      minInput.type = 'number';
      minInput.className = 'optMin';
      minInput.dataset.idx = idx;
      minInput.value = opt.min;
      minInput.style.marginLeft = '10px';
      minInput.style.width = '50px';

      const maxInput = document.createElement('input');
      maxInput.type = 'number';
      maxInput.className = 'optMax';
      maxInput.dataset.idx = idx;
      maxInput.value = opt.max;
      maxInput.style.marginLeft = '6px';
      maxInput.style.width = '50px';

      minInput.addEventListener('input', e => {
        selectedOptions[idx].min = e.target.value;
      });
      maxInput.addEventListener('input', e => {
        selectedOptions[idx].max = e.target.value;
      });

      li.appendChild(document.createTextNode(' min:'));
      li.appendChild(minInput);
      li.appendChild(document.createTextNode(' max:'));
      li.appendChild(maxInput);
    }

    // 삭제 버튼
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '삭제';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.addEventListener('click', () => {
      removeOption(idx);
    });

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
  document.querySelectorAll('.optMin').forEach(input => {
    input.addEventListener('input', e => {
      const i = e.target.dataset.idx;
      selectedOptions[i].min = e.target.value;
    });
  });
  document.querySelectorAll('.optMax').forEach(input => {
    input.addEventListener('input', e => {
      const i = e.target.dataset.idx;
      selectedOptions[i].max = e.target.value;
    });
  });
}




function removeOption(index) {
  selectedOptions.splice(index, 1);
  renderSelectedOptions();
}

// URL 생성 버튼 클릭
const generateBtn = document.getElementById('generateBtn');
generateBtn.addEventListener('click', async () => {
  const ladder = document.getElementById('ladderSelect').value === 'true';
  const mode = document.getElementById('modeSelect').value;
  const ethereal = document.getElementById('etherealCheck').checked;
  const loadingBox = document.getElementById('loadingBox');
  const resultBox = document.getElementById('resultBox');
  resultBox.style.display = 'none';
  loadingBox.style.display = 'block';
  const startTime = Date.now(); // 시작 시각 저장
  let payload;

  if (['material', 'magic', 'rare'].includes(selectedKind)) {
  if (selectedItems.length === 0) {
    alert("⚠ 아이템을 하나 이상 추가해주세요.");
    return;
  }

  payload = {
    items: selectedItems.map(item => ({
      kind: selectedKind,
      itemKey: item.id,
      img: item.img
    })),
    options: [],
    prop_Ladder: ladder,
    prop_Mode: mode,
    prop_Ethereal: ethereal
  };

  // 옵션 처리
  selectedOptions.forEach(opt => {
    const optMeta = allOptionData.find(o => o.id == opt.key);
    if (optMeta?.global) {
      if (opt.checked) {
        const keyName = `prop_${optMeta.name}`;
        payload[keyName] = true;
      }
    } else {
      payload.options.push({
        key: Number(opt.key),
        min: opt.min ? Number(opt.min) : null,
        max: opt.max ? Number(opt.max) : null
      });
    }
  });

} else {
    const itemSelect = document.getElementById('itemSelect');
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
      if (min || max) options.push({ key, min, max });
    });
    payload = {
      ItemKinds: selectedKind,
      ItemKey: selectedItem.id,
      Options: options.map(opt => ({
        key: Number(opt.key),
        min: opt.min ? Number(opt.min) : null,
        max: opt.max ? Number(opt.max) : null
      })),
      prop_Ladder: ladder,
      prop_Mode: mode,
      prop_Ethereal: ethereal
    };
  }

  const res = await fetch(API_CONFIG.MakeTraderieUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  document.getElementById('resultBox').style.display = 'block';
	const tableBody = document.querySelector('#listingTable tbody');
	tableBody.innerHTML = '';
	let count = 1;

	if (json.results) {
		if (Array.isArray(json.results)) {
		  json.results.forEach(result => {
			const itemMeta = selectedItems.find(i => i.id === result.itemKey);

			// 매물 있는 경우
			if (result.listings && result.listings.length > 0) {
			  result.listings.forEach(listing => {
				const row = document.createElement('tr');
				row.innerHTML = `
				  <td>${count++}</td>
				  <td>${itemMeta?.korName || itemMeta?.name || result.itemKey}</td>
				  <td><img src="${itemMeta?.img || ''}" width="30"></td>
				  <td>
					  ${Array.isArray(listing.price_imgs)
						? listing.price_imgs.map((imgGroup, gIdx) => {
							const imgTags = imgGroup.map((img, i) => {
							  const qty = listing.price_qtys?.[gIdx]?.[i] ?? 1;
							  return `
								<img src="${img}" width="20" style="vertical-align:middle;">
								<span style="margin-right:6px;">x${qty}</span>
							  `;
							}).join('');

							const text = listing.price_texts?.[gIdx] || '';

							return `
							  <div style="margin-bottom:6px;">
								${imgTags}
								<div style="font-size:12px; color:gray; margin-top:2px;">${text}</div>
							  </div>
							  ${gIdx < listing.price_imgs.length - 1 ? '<div style="text-align:center; font-size:12px; color:#aaa;">OR</div>' : ''}
							`;
						  }).join('')
						: 'N/A'}
				  </td>
				  <td>${listing.updated_at}</td>
				  <td><a href="https://traderie.com/diablo2resurrected/listing/${listing.id}" target="_blank" style="color:#1a73e8;">확인</a></td>
				`;
				tableBody.appendChild(row);
			  });
			}

			// 매물 없는 경우
			else {
			  const row = document.createElement('tr');
			  row.innerHTML = `
				<td>${count++}</td>
				<td>${itemMeta?.korName || itemMeta?.name || result.itemKey}</td>
				<td><img src="${itemMeta?.img || ''}" width="30"></td>
				<td colspan="2" style="text-align: center; color: gray;">매물 없음</td>
				<td><a href="${result.real_url}" target="_blank" style="color:#1a73e8;">확인</a></td>
			  `;
			  tableBody.appendChild(row);
			}
		  });
		}
	}else{
		
	  const selectedItem = itemData.find(i => i.id == document.getElementById('itemSelect').value);
	  if (json.listings?.length > 0) {
		json.listings.forEach(listing => {
		  const row = document.createElement('tr');
		  row.innerHTML = `
			  <td>${count++}</td>
			  <td>${selectedItem?.korName || selectedItem?.name || selectedItem?.id}</td>
			  <td><img src="${selectedItem?.img || ''}" width="30"></td>
			  <td>
				  ${Array.isArray(listing.price_imgs)
					? listing.price_imgs.map((imgGroup, gIdx) => {
						const imgTags = imgGroup.map((img, i) => {
						  const qty = listing.price_qtys?.[gIdx]?.[i] ?? 1;
						  return `
							<img src="${img}" width="20" style="vertical-align:middle;">
							<span style="margin-right:6px;">x${qty}</span>
						  `;
						}).join('');

						const text = listing.price_texts?.[gIdx] || '';

						return `
						  <div style="margin-bottom:6px;">
							${imgTags}
							<div style="font-size:12px; color:gray; margin-top:2px;">${text}</div>
						  </div>
						  ${gIdx < listing.price_imgs.length - 1 ? '<div style="text-align:center; font-size:12px; color:#aaa;">OR</div>' : ''}
						`;
					  }).join('')
					: 'N/A'}
			  </td>
			  <td>${listing.updated_at}</td>
			  <td><a href="https://traderie.com/diablo2resurrected/listing/${listing.id}" target="_blank" style="color:#1a73e8;">확인</a></td>
			`;
		  tableBody.appendChild(row);
		});
	  } else {
		const row = document.createElement('tr');
		row.innerHTML = `
		  <td>${count++}</td>
		  <td>${selectedItem?.korName || selectedItem?.name || selectedItem?.id}</td>
		  <td><img src="${selectedItem?.img || ''}" width="30"></td>
		  <td colspan="2" style="text-align: center; color: gray;">매물 없음</td>
		  <td><a href="${json.real_url}" target="_blank" style="color:#1a73e8;">확인</a></td>
		`;
		tableBody.appendChild(row);
	  }
	}
	// ✅ 최소 5초 대기 후 로딩 박스 숨기기
	const elapsed = Date.now() - startTime;
	const remaining = 5000 - elapsed;
	if (remaining > 0) {
	  await new Promise(resolve => setTimeout(resolve, remaining));
	}
	loadingBox.style.display = 'none';
	// ✅ 유니크 등 단일 검색 결과 처리
});
