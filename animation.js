// animation.js
// Requires Anime.js to be loaded in the HTML

/**
 * Show a stack tube (outer box) in the revealed animation-step.
 * Adds a label 'Stack' above the tube. Only creates the tube and label if not already present.
 * Dynamically creates stack data frames inside the stack based on stack_data_frame.
 * Each frame shows variable name (or name), address, and size if present.
 * Dynamically adjusts width to fit content and stay inside animation-step.
 * Dynamically adjusts the animation-step revealed section height to fit the stack.
 * Uses more compact sizing for stack, frames, and label.
 * Stack tube is wider than the data frames for a better visual effect.
 * Data frames are rendered in LIFO order (frame_1 at bottom, frame_N at top).
 * If the current step is an update_variable, show value after '=' in the frame and animate the change.
 * The animation-step revealed section is split into three areas: stack (left), description (center), output (right).
 */
function showStackFrame(stepIndex, stackDataFrame, updateVarInfo, step, varValuesArg) {
  // Get the step container
  let stepDiv = document.querySelector(`.animation-step[data-step='${stepIndex}']`);
  if (!stepDiv) stepDiv = document.querySelector('.animation-box');

  // Layout setup
  Object.assign(stepDiv.style, {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: '24px',
    minHeight: '180px',
    padding: '18px 8px',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.01)',
    borderRadius: '14px',
    position: 'relative',
  });

  // Remove previous sections except stack-frame-wrapper
  Array.from(stepDiv.children).forEach(child => {
    if (!child.classList.contains('stack-frame-wrapper')) stepDiv.removeChild(child);
  });

  // --- STACK SECTION (LEFT) ---
  let stackWrapper = stepDiv.querySelector('.stack-frame-wrapper');
  if (!stackWrapper) {
    stackWrapper = document.createElement('div');
    stackWrapper.className = 'stack-frame-wrapper';
    stepDiv.insertBefore(stackWrapper, stepDiv.firstChild);
  }
  Object.assign(stackWrapper.style, {
    minWidth: '120px',
    maxWidth: '220px',
    flex: '0 0 160px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: '0',
    boxSizing: 'border-box',
    padding: '0',
    background: 'none',
  });

  // Add a label 'Stack' above the stack container if not present
  let label = stackWrapper.querySelector('.stack-label');
  if (!label) {
    label = document.createElement('div');
    label.className = 'stack-label';
    label.textContent = 'Stack';
    Object.assign(label.style, {
      fontFamily: 'Inter, JetBrains Mono, Fira Code, monospace',
      fontWeight: '700',
      fontSize: '13px',
      letterSpacing: '0.3px',
      color: '#0097a7',
      background: 'linear-gradient(90deg, #e0f7fa 60%, #b2ebf2 100%)',
      borderRadius: '6px',
      padding: '3px 10px',
      margin: '0 0 6px 0',
      display: 'inline-block',
      boxShadow: '0 1px 4px rgba(0,151,167,0.06)',
      border: '1px solid #b2ebf2',
      userSelect: 'none',
      textAlign: 'center',
    });
    stackWrapper.appendChild(label);
  }

  // Stack tube (container)
  let stackContainer = stackWrapper.querySelector('.stack-container');
  if (!stackContainer) {
    stackContainer = document.createElement('div');
    stackContainer.className = 'stack-container';
    stackWrapper.appendChild(stackContainer);
  }
  Object.assign(stackContainer.style, {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: '80px',
    maxWidth: '95%',
    background: '#fff',
    border: '2px solid #0097a7',
    borderRadius: '12px',
    marginTop: '14px',
    overflow: 'visible',
    boxSizing: 'border-box',
    position: 'relative',
    padding: '6px 0',
    transition: 'width 0.2s cubic-bezier(.4,0,.2,1)',
  });

  // --- CLEAR STACK LOGIC ---
  if (step && step.stack_update && step.stack_update.action === 'clear_stack') {
    stackContainer.innerHTML = '';
    const emptyDiv = document.createElement('div');
    emptyDiv.textContent = 'Stack is empty';
    Object.assign(emptyDiv.style, {
      color: '#b2ebf2',
      fontSize: '13px',
      fontStyle: 'italic',
      opacity: 0.7,
      margin: '18px 0',
      textAlign: 'center',
      userSelect: 'none',
    });
    stackContainer.appendChild(emptyDiv);
  } else {
    // --- DYNAMIC STACK DATA FRAMES ---
    stackContainer.innerHTML = '';
    let widest = 60;
    let frameBlocks = [];
    let highlightIndex = -1;
    if (stackDataFrame && stackDataFrame.no_of_data_frame) {
      const count = parseInt(stackDataFrame.no_of_data_frame.replace('create_', ''));
      for (let i = 1; i <= count; i++) {
        const key = `data_frame_${i}`;
        const frameData = stackDataFrame[key];
        const frameBlock = document.createElement('div');
        frameBlock.className = 'stack-data-frame';
        Object.assign(frameBlock.style, {
          background: '#b2f3f8',
          border: '1.5px solid #222',
          borderRadius: '7px',
          margin: '6px 0',
          padding: '6px 4px',
          minWidth: '60px',
          maxWidth: '180px',
          boxSizing: 'border-box',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          fontWeight: '600',
          fontSize: '12px',
          color: '#222',
          textAlign: 'center',
          userSelect: 'none',
          transition: 'width 0.2s cubic-bezier(.4,0,.2,1)',
          wordBreak: 'break-all',
          width: 'auto',
        });
        let mainLabel = '';
        let isVar = false;
        if (frameData && frameData.name) {
          mainLabel = frameData.name;
        } else if (frameData && frameData.variable_name) {
          mainLabel = frameData.variable_name;
          isVar = true;
        }
        let isHighlighted = false;
        let valueToShow = undefined;
        if (isVar && frameData.variable_name && varValuesArg && varValuesArg[frameData.variable_name] !== undefined) {
          valueToShow = varValuesArg[frameData.variable_name];
        }
        if (
          isVar &&
          updateVarInfo &&
          updateVarInfo.variable_name === frameData.variable_name &&
          typeof updateVarInfo.variable_value !== 'undefined'
        ) {
          valueToShow = updateVarInfo.variable_value;
          isHighlighted = true;
          highlightIndex = i - 1;
        }
        if (isVar && valueToShow !== undefined) {
          mainLabel += ` = ${valueToShow}`;
        }
        let subLabel = '';
        if (frameData && frameData.address) subLabel += frameData.address;
        if (frameData && frameData.size) {
          if (subLabel) subLabel += ' | ';
          subLabel += frameData.size;
        }
        frameBlock.innerHTML = `<div class='main-label' style="font-size:13px;font-weight:700;">${mainLabel}</div>`;
        if (subLabel) {
          frameBlock.innerHTML += `<div style='font-size:10px;color:#555;opacity:0.8;margin-top:2px;'>${subLabel}</div>`;
        }
        if (isHighlighted) frameBlock.classList.add('highlight-stack-frame');
        stackContainer.appendChild(frameBlock);
        frameBlocks.push(frameBlock);
      }
    }
    // --- Make stack tube wider than data frames ---
    setTimeout(() => {
      let maxWidth = widest;
      frameBlocks.forEach(block => {
        const rect = block.getBoundingClientRect();
        if (rect.width > maxWidth) maxWidth = rect.width;
      });
      frameBlocks.forEach(block => { block.style.width = maxWidth + 'px'; });
      let stackWidth = Math.floor(maxWidth * 1.3);
      if (stackWidth < 100) stackWidth = 100;
      stackContainer.style.width = stackWidth + 'px';
      stackContainer.style.minWidth = stackWidth + 'px';
      stackContainer.style.maxWidth = stackWidth + 'px';
      stackContainer.style.marginLeft = 'auto';
      stackContainer.style.marginRight = 'auto';
      stackWrapper.style.alignItems = 'center';
      frameBlocks.forEach(block => {
        block.style.marginLeft = 'auto';
        block.style.marginRight = 'auto';
      });
      if (highlightIndex >= 0 && frameBlocks[highlightIndex]) {
        const frame = frameBlocks[highlightIndex];
        frame.style.transition = 'background 0.2s, box-shadow 0.2s';
        frame.style.background = '#ffe066';
        frame.style.boxShadow = '0 0 0 3px #ffe06699, 0 1px 2px rgba(0,0,0,0.05)';
        const mainLabelDiv = frame.querySelector('.main-label');
        if (mainLabelDiv) {
          mainLabelDiv.style.color = '#222';
          mainLabelDiv.style.fontWeight = '900';
          mainLabelDiv.style.transition = 'color 0.2s, font-weight 0.2s';
        }
        setTimeout(() => {
          frame.style.background = '#b2f3f8';
          frame.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          if (mainLabelDiv) {
            mainLabelDiv.style.color = '#222';
            mainLabelDiv.style.fontWeight = '700';
          }
          frame.classList.remove('highlight-stack-frame');
        }, 1000);
      }
      // --- DYNAMIC HEIGHT ADJUSTMENT ---
      const stackRect = stackContainer.getBoundingClientRect();
      const labelRect = label ? label.getBoundingClientRect() : { height: 0 };
      const neededHeight = Math.max(stackRect.height + labelRect.height + 24, descDiv.offsetHeight, outputDiv.offsetHeight) + 12;
      if (stepDiv.offsetHeight < neededHeight) {
        stepDiv.style.minHeight = neededHeight + 'px';
      }
    }, 0);
  }

  // --- DESCRIPTION & OUTPUT SECTION (CENTER & RIGHT) ---
  // Remove any existing .desc-output-row before creating a new one
  let oldDescOutputRow = stepDiv.querySelector('.desc-output-row');
  if (oldDescOutputRow) stepDiv.removeChild(oldDescOutputRow);
  const descOutputRow = document.createElement('div');
  descOutputRow.className = 'desc-output-row';
  Object.assign(descOutputRow.style, {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '36px',
    flex: '1 1 auto',
    minWidth: '160px',
    maxWidth: '1100px',
    margin: '0 0 0 12px',
  });

  // --- DESCRIPTION SECTION (LEFT of row) ---
  let descBox = document.createElement('div');
  descBox.style.display = 'flex';
  descBox.style.flexDirection = 'column';
  descBox.style.flex = '1 1 0';
  descBox.style.minWidth = '80px';
  descBox.style.maxWidth = '700px';

  let descLabel = document.createElement('div');
  descLabel.textContent = 'Description';
  Object.assign(descLabel.style, {
    fontWeight: '700',
    fontSize: '13px',
    color: '#3fb950',
    marginBottom: '6px',
    letterSpacing: '0.2px',
    fontFamily: 'Inter, JetBrains Mono, Fira Code, monospace',
  });

  let descDiv = document.createElement('div');
  descDiv.className = 'step-description';
  Object.assign(descDiv.style, {
    flex: '1 1 0',
    background: 'rgba(240,248,255,0.7)',
    borderRadius: '10px',
    padding: '18px 18px',
    fontFamily: 'Inter, JetBrains Mono, Fira Code, monospace',
    fontSize: '15px',
    color: '#222',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'left',
    border: '1px solid #e0e0e0',
    wordBreak: 'break-word',
    whiteSpace: 'pre-line',
    height: 'auto',
    minHeight: 'unset',
    maxHeight: 'unset',
  });
  descDiv.textContent = (step && step.description) ? step.description : '';
  descBox.appendChild(descLabel);
  descBox.appendChild(descDiv);

  // --- OUTPUT SECTION (RIGHT of row) ---
  let outputBox = document.createElement('div');
  outputBox.style.display = 'flex';
  outputBox.style.flexDirection = 'column';
  outputBox.style.flex = '0 1 220px';
  outputBox.style.minWidth = '80px';
  outputBox.style.maxWidth = '350px';

  let outputLabel = document.createElement('div');
  outputLabel.textContent = 'Output';
  Object.assign(outputLabel.style, {
    fontWeight: '700',
    fontSize: '13px',
    color: '#58a6ff',
    marginBottom: '6px',
    letterSpacing: '0.2px',
    fontFamily: 'Inter, JetBrains Mono, Fira Code, monospace',
  });

  let outputDiv = document.createElement('div');
  outputDiv.className = 'step-output';
  Object.assign(outputDiv.style, {
    background: 'rgba(0,151,167,0.07)',
    borderRadius: '10px',
    padding: '14px 10px',
    fontFamily: 'JetBrains Mono, Fira Code, monospace',
    fontSize: '14px',
    color: '#0097a7',
    boxShadow: '0 1px 8px rgba(0,151,167,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    border: '1px solid #b2ebf2',
    margin: '0',
    wordBreak: 'break-word',
    whiteSpace: 'pre-line',
    height: 'auto',
    minHeight: 'unset',
    maxHeight: 'unset',
  });
  outputDiv.textContent = (step && step.output_update) ? step.output_update : '';
  outputBox.appendChild(outputLabel);
  outputBox.appendChild(outputDiv);

  descOutputRow.appendChild(descBox);
  descOutputRow.appendChild(outputBox);
  stepDiv.appendChild(descOutputRow);

  // Hide description and output sections from all other steps
  document.querySelectorAll('.animation-step').forEach((div, idx) => {
    if (idx !== stepIndex - 1) {
      const row = div.querySelector('.desc-output-row');
      if (row) row.style.display = 'none';
    } else {
      const row = div.querySelector('.desc-output-row');
      if (row) row.style.display = '';
    }
  });
}

/**
 * Rebuilds the stack and variable state up to the selected step, then renders the stack frame.
 */
function runAnimationSteps(steps, stepIndex) {
  let stackDataFrame = null;
  let varValues = {};
  let outputs = [];
  for (let i = 0; i < stepIndex; i++) {
    const s = steps[i];
    if (s.stack_update && s.stack_update.action === 'create_stack_frame') {
      stackDataFrame = JSON.parse(JSON.stringify(s.stack_update.stack_data_frame));
      varValues = {}; // Reset variables on new stack frame
    }
    if (s.stack_update && s.stack_update.action === 'update_variable') {
      if (stackDataFrame && s.stack_update.variable_name !== undefined) {
        varValues[s.stack_update.variable_name] = s.stack_update.variable_value;
      }
    }
    if (s.stack_update && s.stack_update.action === 'clear_stack') {
      stackDataFrame = null;
      varValues = {};
    }
    if (s.output_update !== undefined && s.output_update !== null) {
      outputs.push(s.output_update);
    }
  }
  const step = steps[stepIndex - 1];
  showStackFrame(
    stepIndex,
    stackDataFrame,
    (step && step.stack_update && step.stack_update.action === 'update_variable')
      ? { variable_name: step.stack_update.variable_name, variable_value: step.stack_update.variable_value }
      : undefined,
    Object.assign({}, step, { output_update: outputs.join('\n') }),
    varValues
  );
}

// Expose to global for UI integration
window.runAnimationSteps = runAnimationSteps;
 