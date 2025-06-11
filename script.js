// 📌 전역 변수
let itemData = [];
let selectedKind = "";
let selectedItems = [];
let selectedOptions = [];
let allOptionData = []; // ✅ 전체 옵션 저장
let runewordCategoryData = [];  // ✅ /ItemList에서 받은 category 정보 저장


// API 주소 입력/저장 관리
const apiInput = document.getElementById('api-url-input');
const saveApiBtn = document.getElementById('save-api-url');
const resetApiBtn = document.getElementById('reset-api-url');
const API_KEY = 'API_BASE_URL';

function applyApiState() {
	
  //const savedUrl = localStorage.getItem(API_KEY);
    apiInput.value = BASE;
    apiInput.disabled = false;
    saveApiBtn.disabled = false;
    resetApiBtn.style.display = 'inline';

  /*if (savedUrl) {
    apiInput.value = BASE;
    apiInput.disabled = true;
    saveApiBtn.disabled = true;
    resetApiBtn.style.display = 'inline';
  } else {
    apiInput.disabled = false;
    saveApiBtn.disabled = false;
    resetApiBtn.style.display = 'none';
  }*/
  
}
function renderRunewordTypeCheckboxCombo(selectedItem, categoryData) {
	console.log('renderRunewordTypeCheckboxCombo');
  const wrapper = document.getElementById('runewordTypeComboWrapper');
  wrapper.innerHTML = '';
  wrapper.style.display = 'block';

  // ✅ type에서 모든 type을 eng(lowercase)로 추출 (string or object)
	const simplifiedTypes = (selectedItem.type || []).map(t => {
	  if (typeof t === 'string') {
		return t.split('(')[0].trim().toLowerCase();  // 예전 포맷 호환
	  } else if (typeof t === 'object' && t.eng) {
		return t.eng.toLowerCase();
	  } else if (typeof t === 'object' && t.ctg) {
		return t.ctg.toLowerCase();  // 안전망
	  }
	  return '';
	});

  // ✅ categoryData에서 해당 group 또는 ctg가 매칭되는 항목 필터링
  const matchedCategories = categoryData.filter(cat =>
    simplifiedTypes.includes(cat.group?.toLowerCase()) || simplifiedTypes.includes(cat.ctg?.toLowerCase())
  );

  // 콤보박스 UI 생성
  const comboContainer = document.createElement('div');
  comboContainer.style.position = 'relative';
  comboContainer.style.display = 'inline-block';
  comboContainer.style.minWidth = '300px';

  const comboButton = document.createElement('button');
  comboButton.textContent = '아이템 타입 선택';
  comboButton.style.width = '100%';
  comboButton.style.padding = '6px';
  comboButton.style.cursor = 'pointer';

  const dropdown = document.createElement('div');
  dropdown.style.position = 'absolute';
  dropdown.style.top = '100%';
  dropdown.style.left = '0';
  dropdown.style.zIndex = '1000';
  dropdown.style.background = 'white';
  dropdown.style.border = '1px solid #ccc';
  dropdown.style.padding = '8px';
  dropdown.style.maxHeight = '200px';
  dropdown.style.overflowY = 'auto';
  dropdown.style.display = 'none';
  dropdown.style.minWidth = '300px';

  // 전체 선택 / 해제 버튼
  const selectAllBtn = document.createElement('button');
  selectAllBtn.textContent = '전체 선택';
  selectAllBtn.style.marginRight = '6px';
  selectAllBtn.addEventListener('click', () => {
    dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
  });

  const clearAllBtn = document.createElement('button');
  clearAllBtn.textContent = '선택 해제';
  clearAllBtn.addEventListener('click', () => {
    dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  });

  dropdown.appendChild(selectAllBtn);
  dropdown.appendChild(clearAllBtn);
  dropdown.appendChild(document.createElement('hr'));
	const searchInput = document.createElement('input');
	searchInput.type = 'text';
	searchInput.placeholder = '타입 필터';
	searchInput.style.width = '100%';
	searchInput.style.padding = '6px';
	searchInput.style.marginBottom = '8px';
	searchInput.style.boxSizing = 'border-box';
	searchInput.style.border = '1px solid #ccc';
	searchInput.style.borderRadius = '4px';
	dropdown.appendChild(searchInput);
	searchInput.addEventListener('input', () => {
	  const keyword = searchInput.value.trim().toLowerCase();
	  dropdown.querySelectorAll('label').forEach(label => {
		const text = label.textContent.trim().toLowerCase();
		label.style.display = text.includes(keyword) ? 'flex' : 'none';
	  });
	});
  // ✅ 체크박스 렌더링
	// ✅ 바뀐 부분: 텍스트를 span으로 감싸고 label을 flex로
	matchedCategories.forEach(cat => {
	  const label = document.createElement('label');
	  label.className = 'runeword-checkbox-label'; // CSS 스타일 연결
	  label.style.display = 'flex';
	  label.style.alignItems = 'center';
	  label.style.gap = '8px';
	  label.style.margin = '6px 0';
	  label.style.fontSize = '0.95em';
	  label.style.cursor = 'pointer';
	  
	

	  const checkbox = document.createElement('input');
	  checkbox.type = 'checkbox';
	  checkbox.name = 'runewordCategory';
	  checkbox.value = cat.id;
	  checkbox.style.margin = '0';
	  checkbox.style.transform = 'scale(1.1)';
	  checkbox.style.verticalAlign = 'middle';

	  const span = document.createElement('span');
	  span.textContent = cat.korName || cat.name;
	  span.style.lineHeight = '1';

	  const isSameSocket = selectedItem.sockets === cat.sockets;
	  const isSameType = simplifiedTypes.includes((cat.group || cat.ctg || '').toLowerCase());
	  checkbox.checked = isSameSocket && isSameType;

	  label.appendChild(checkbox);
	  label.appendChild(span); // ✅ 텍스트는 span에 담아야 정렬됨
	  

	  dropdown.appendChild(label);
	  
	});

  comboButton.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  
  


  comboContainer.appendChild(comboButton);
  comboContainer.appendChild(dropdown);
  wrapper.appendChild(comboContainer);
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

//옵션 내용 초기화 
function resetRunewordOptionsUI() {
  document.getElementById('optionsContainer').innerHTML = '';
  document.getElementById('runewordOptionInputs').innerHTML = '';
  selectedRunewordOptions = [];
}

async function handleRunewordSelection(itemRes) {
  const itemDataRes = await itemRes.json();
  itemData = itemDataRes.items || [];
  optionData= itemDataRes.options || [];
  runewordCategoryData = itemDataRes.category || [];
  //전역변수에 옵션리스트를 저장한다.
  loadOptionComboBox(optionData);

  const runewordCategoryWrapper = document.getElementById('runewordTypeComboWrapper');
  const optionCombo = document.getElementById('optionCombo');
  const itemSelect = document.getElementById('itemSelect');

  // 기존 categoryWrapper는 룬워드에서는 사용하지 않음!
  const categoryWrapper = document.getElementById('categoryWrapper');
  if (categoryWrapper) categoryWrapper.style.display = 'none';

  // 룬워드 관련 UI 표시
  itemSelect.style.display = 'block';
  optionCombo.style.display = 'block';
  runewordCategoryWrapper.style.display = 'block';

  // 아이템 목록 렌더링
  itemSelect.innerHTML = '';
  itemData.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.korName || item.name;
    itemSelect.appendChild(opt);
  });
  
  // 아이템 목록 렌더링
  optionCombo.innerHTML = '';
  optionData.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.koKR;
    optionCombo.appendChild(opt);
  });

  if (itemData.length > 0) {
    itemSelect.dispatchEvent(new Event('change'));
  }
  if (optionData.length > 0) {
    optionCombo.dispatchEvent(new Event('change'));
  }
}



function renderRunewordCategoryCombo(categoryList) {
  const container = document.getElementById('runewordTypeComboWrapper');
  container.innerHTML = '';

  categoryList.forEach(cat => {
    const label = document.createElement('label');
    label.style.marginRight = '12px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'runewordCategory';
    checkbox.value = cat.id;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${cat.korName || cat.name}`));
    container.appendChild(label);
  });

  container.style.display = 'block';
}



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
		const selectedItem = filtered[0];
		itemSelect.value = selectedItem.id;
		itemSelect.dispatchEvent(new Event('change'));
		
				// ✅ 여기 추가
		if (selectedKind === 'runwords') {
		  renderRunewordTypeCheckboxCombo(selectedItem, runewordCategoryData);
		}
	  
		if (['unique', 'runwords'].includes(selectedKind)) {
		  const notice = document.createElement('p');
		  notice.textContent = '🛈 옵션을 제외하고 싶을 땐 빈값을 입력하세요';
		  notice.style.color = 'gray';
		  notice.style.marginBottom = '8px';
		  optionsContainer.appendChild(notice);
		}  
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
//renderItemKinds(data.itemKinds);


  } catch (error) {
    console.error("초기 데이터 로딩 실패:", error);
  }
  
  

  // 공통 iframe 생성 함수
  function createYouTubeIframe(videoId, title) {
    const iframe = document.createElement("iframe");
    //iframe.width = "320";
    //iframe.height = "180";
	 // ✅ 전체 채우기 스타일
	//iframe.style.width = "100%";
	//iframe.style.height = "100%";
	//iframe.style.border = "none";
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = title || "YouTube video player";
    //iframe.frameBorder = "0";
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
	resetRunewordOptionsUI(); // ← 추가
    selectedKind = kindSelect.value;

    // 선택에 따라 UI 컨트롤 표시 여부 조절
    const showExtras = ['material', 'magic', 'rare'].includes(selectedKind);
	const isRuneword = selectedKind === 'runwords';
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
		opt.value = ctg.id || ctg.eng;  // value는 eng나 id
		const kor = ctg.korName || ctg.kor;
		const eng = ctg.id || ctg.eng;
		opt.textContent = kor ? `${kor} (${eng})` : eng;
		categorySelect.appendChild(opt);
	  });
      if (ctgList.length > 0) categorySelect.dispatchEvent(new Event('change'));
    }
	else if (isRuneword) {
		await handleRunewordSelection(itemRes);  // 🔥 이 함수를 따로 만듦
		
		
		
		
	}else {
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
	resetRunewordOptionsUI(); // ← 추가
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
  
  
  // 룬워드 선택 시 type 체크박스 표시
	itemSelect.addEventListener('change', () => {
		resetRunewordOptionsUI(); // ← 추가
		const selectedItem = itemData.find(i => i.id == itemSelect.value);
		if (!selectedItem) return;

		showItemOptions(selectedItem, selectedKind);

		if (selectedKind === 'runwords') {
		  document.getElementById('runewordTypeComboWrapper').style.display = 'block';
		  renderRunewordTypeCheckboxCombo(selectedItem, runewordCategoryData);
		} else {
		  document.getElementById('runewordTypeComboWrapper').style.display = 'none';
		//runewordCategoryWrapper.style.display = 'none';
		}
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
  if (!opt) return '(옵션 없음)';
  if (!opt.koKR) return opt.name || '(이름 없음)';
  return opt.koKR.replace(/%d/g, '10').replace(/%s/g, '스킬명').replace(/%%/g, '%');
}
function showItemOptions(item, kind) {
  const container = (kind === 'runwords')
    ? document.getElementById('runewordOptionInputs')
    : document.getElementById('optionsContainer');
    
  container.innerHTML = '';

  const image = document.getElementById('itemImage');
  
  if (item && item.img) {
    image.src = item.img;
    image.hidden = false;
  } else {
    image.hidden = true;
  }

  // 유니크 아이템에 한해 옵션 표시
  if ( (kind === 'unique'|| kind==='runwords') && Array.isArray(item.description_filtered)) {
    // 안내문구
	// 안내 문구가 이미 존재하면 추가하지 않음
	if (!container.querySelector('.option-notice')) {
	  const notice = document.createElement('p');
	  notice.className = 'option-notice';
	  notice.textContent = '🛈 옵션을 제외하고 싶을 땐 빈값을 입력하세요';
	  notice.style.color = 'gray';
	  notice.style.marginBottom = '8px';
	  container.appendChild(notice);
	}

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
console.log("optionCombo.addEventListener=="+selectedKind);


  if (!['material', 'magic', 'rare','runwords'].includes(selectedKind)) return;
  const selectedId = optionCombo.value;
  const selectedMeta = allOptionData.find(opt => opt.id == selectedId);
  console.log('selectedId==='+selectedId);
  console.log('selectedMeta==='+selectedMeta);
 
  if (!selectedId || selectedOptions.find(opt => opt.key == selectedId)) return;
	
  if (selectedMeta?.global) {
    selectedOptions.push({ key: selectedId, label: formatOptionText(selectedMeta), checked: false });
  } else {
	console.log(' not global options ');
    selectedOptions.push({ key: selectedId, min: '', max: '', label: formatOptionText(selectedMeta) });
  }
  renderSelectedOptions();
});

function renderSelectedOptions() {
	console.log('function renderSelectedOptions');
	//runwords일땐 옵션 컨테이너 박스 명이 다름
	
	// ✅ selectedRunewordOptions에 복사해주기
  if (selectedKind === 'runwords') {
    selectedRunewordOptions = [...selectedOptions]; // ✅ 이 줄 추가
  }
  const list = (selectedKind === 'runwords')
    ? document.getElementById('selectedRunewordOptions')
    : document.getElementById('optionList');

  list.innerHTML = '';

  selectedOptions.forEach((opt, idx) => {
    const optionMeta = allOptionData.find(o => o.id == opt.key);
    const li = document.createElement(selectedKind === 'runwords' ? 'div' : 'li');

    li.innerHTML = '';

    // 옵션명
    const label = document.createElement('span');
	label.textContent = opt.label || optionMeta?.koKR || optionMeta?.name || '(알 수 없음)';
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
		console.log('=====drawing not global options=====');
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

	// 기본 옵션 수집
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

	// 기본 payload
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

	// ✅ 룬워드일 때 사용자 추가 옵션 병합
	if (selectedKind === 'runwords' && Array.isArray(selectedRunewordOptions)) {
		console.log(" 룬워드 옵션 추가 ");
		const socketCount = selectedItem?.sockets ?? null;

	  selectedRunewordOptions.forEach(opt => {
		const optKey = Number(opt.key);
		const isAlreadyIncluded = Array.isArray(payload.Options) && payload.Options.some(existing => existing.key === optKey);
		if (!isAlreadyIncluded) {
		  payload.Options.push({
			key: optKey,
			min: opt.min ? Number(opt.min) : null,
			max: opt.max ? Number(opt.max) : null
		  });
		}
	  });
	  const checkedBoxes = document.querySelectorAll('#runewordTypeComboWrapper input[type="checkbox"]:checked');
	  const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);
	  const selectedItemId = document.getElementById('itemSelect').value;
		const matchedGroup = [
		  ...new Set(
			itemData
			  .filter(item => String(item.id) === selectedItemId)
			  .map(item => item["min-max-filter"])
			  .filter(Boolean)
		  )
		];
		console.log("선택된 ID:", selectedItemId);
console.log("매칭된 Group:", matchedGroup);
	  const matchedid = runewordCategoryData
		  .filter(cat => selectedIds.includes(String(cat.id)))
		  .map(cat => cat.name)  // or cat.en, if it's stored as cat.en
		  .filter(Boolean);      // null/undefined 방지
console.log("매칭된 matchedid:", matchedid);
	  if (matchedGroup.length > 0) {
		const typeKey = `prop_Base Item (${matchedGroup}) ${socketCount}`;
	    payload[typeKey] = matchedid.join(', ');
	  }

	}

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
