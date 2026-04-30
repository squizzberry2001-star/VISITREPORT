(function () {
  'use strict';

  const TEMPLATE = window.RBV_PDF_TEMPLATE_ASSETS || {};

  function plainText(value, fallback) {
    let raw = value === undefined || value === null ? '' : String(value);
    raw = raw
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\r/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return raw || (fallback === undefined ? '-' : fallback);
  }

  function text(value, fallback) {
    return plainText(value, fallback);
  }

  function sanitizeFileName(value) {
    return String(value || 'Regional_Bestie_Visit_Report')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_') || 'Regional_Bestie_Visit_Report';
  }

  function formatDate(value) {
    const raw = text(value, '');
    if (!raw || raw === '-') return '-';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function buildFileName(data) {
    return sanitizeFileName('Regional_Bestie_Visit_Report_' + text(data && data.store, 'Store')) + '.pdf';
  }

  function getStoreDetail(storeName) {
    if (typeof window.getStoreWebDetail === 'function') {
      try { return window.getStoreWebDetail(storeName) || {}; } catch (error) {}
    }
    return {};
  }

  function addWrapped(doc, value, x, y, width, lineHeight, options) {
    const lines = doc.splitTextToSize(text(value), width);
    doc.text(lines, x, y, options || {});
    return y + Math.max(1, lines.length) * lineHeight;
  }

  async function prepareImage(src) {
    return new Promise(function (resolve) {
      if (!src) return resolve(null);
      const img = new Image();
      img.onload = function () {
        try {
          const canvas = document.createElement('canvas');
          const maxSide = 2200;
          let width = img.naturalWidth || img.width || 1;
          let height = img.naturalHeight || img.height || 1;
          const ratio = Math.min(1, maxSide / Math.max(width, height));
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          context.drawImage(img, 0, 0, width, height);
          resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.88), width: width, height: height, canvas: canvas });
        } catch (error) { resolve(null); }
      };
      img.onerror = function () { resolve(null); };
      img.crossOrigin = 'anonymous';
      img.src = src;
    });
  }

  async function addImageInBox(doc, src, x, y, width, height, mode) {
    const prepared = await prepareImage(src);
    if (!prepared) return false;

    if (mode === 'coverCrop') {
      try {
        const targetAspect = width / height;
        let sx = 0;
        let sy = 0;
        let sw = prepared.width;
        let sh = prepared.height;
        const sourceAspect = prepared.width / prepared.height;
        if (sourceAspect > targetAspect) {
          sw = prepared.height * targetAspect;
          sx = (prepared.width - sw) / 2;
        } else {
          sh = prepared.width / targetAspect;
          sy = (prepared.height - sh) / 2;
        }
        const canvas = document.createElement('canvas');
        const outW = Math.max(480, Math.round(width * 8));
        const outH = Math.max(480, Math.round(height * 8));
        canvas.width = outW;
        canvas.height = outH;
        const context = canvas.getContext('2d');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(prepared.canvas, sx, sy, sw, sh, 0, 0, outW, outH);
        doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', x, y, width, height);
        return true;
      } catch (error) {
        doc.addImage(prepared.dataUrl, 'JPEG', x, y, width, height);
        return true;
      }
    }

    const aspect = prepared.width / prepared.height;
    let targetWidth = width;
    let targetHeight = height;
    if (mode === 'cover') {
      if (aspect > targetWidth / targetHeight) targetWidth = targetHeight * aspect;
      else targetHeight = targetWidth / aspect;
    } else if (aspect > targetWidth / targetHeight) {
      targetHeight = targetWidth / aspect;
    } else {
      targetWidth = targetHeight * aspect;
    }
    const tx = x + (width - targetWidth) / 2;
    const ty = y + (height - targetHeight) / 2;
    doc.addImage(prepared.dataUrl, 'JPEG', tx, ty, targetWidth, targetHeight);
    return true;
  }

  function addBackground(doc, key, pageWidth, pageHeight) {
    if (!TEMPLATE[key]) return false;
    try {
      doc.addImage(TEMPLATE[key], 'JPEG', 0, 0, pageWidth, pageHeight);
      return true;
    } catch (error) {
      return false;
    }
  }

  function normalizeRows(rows) {
    return (Array.isArray(rows) ? rows : [])
      .map(function (row) {
        return {
          temuan: text(row && row.temuan, ''),
          kondisiIdeal: text(row && row.kondisiIdeal, ''),
          dampak: text(row && row.dampak, ''),
          penyebab: text(row && row.penyebab, ''),
          tindakan: text(row && row.tindakan, ''),
          deadline: text(row && row.deadline, ''),
          hasil: text(row && row.hasil, '')
        };
      })
      .filter(function (row) {
        return Object.keys(row).some(function (key) {
          const value = text(row[key], '');
          return value && value !== '-';
        });
      });
  }

  function normalizePhotos(photos) {
    return (Array.isArray(photos) ? photos : [])
      .map(function (photo) {
        return { image: photo && photo.image ? photo.image : '', description: text(photo && photo.description, '') };
      })
      .filter(function (photo) { return photo.image || photo.description; });
  }

  function normalizeQscPhotos(data) {
    const modern = Array.isArray(data && data.qscResultPhotos) ? data.qscResultPhotos : [];
    const legacy = data && data.qscResultPhoto ? [data.qscResultPhoto] : [];
    const source = modern.length ? modern : legacy;
    return [0, 1].map(function (index) {
      const item = source[index] || {};
      return { image: item.image || '', description: text(item.description, '') };
    });
  }

  function drawTopBar(doc, title, palette, pageWidth) {
    doc.setFillColor.apply(doc, palette.primary);
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(title, 12, 11.8);
  }

  function drawSubtlePageTitle(doc, title, subtitle, palette, pageWidth, margin) {
    doc.setTextColor.apply(doc, palette.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(title, margin, 24);
    if (subtitle) {
      doc.setTextColor(82, 82, 91);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.text(subtitle, margin, 32);
    }
    doc.setDrawColor.apply(doc, palette.primary);
    doc.setLineWidth(0.4);
    doc.line(margin, 37, pageWidth - margin, 37);
  }

  function addFooter(doc, pageWidth, pageHeight) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(188, 198, 208);
    doc.text('GENERATE BY BESTIE VISIT WEB REPORT', pageWidth / 2, pageHeight - 4.8, { align: 'center' });
  }

  function applyFooterAllPages(doc, pageWidth, pageHeight) {
    const totalPages = typeof doc.internal.getNumberOfPages === 'function' ? doc.internal.getNumberOfPages() : 1;
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      addFooter(doc, pageWidth, pageHeight);
    }
  }

  function drawLabelValue(doc, label, value, x, y, labelWidth, maxWidth, palette, options) {
    const opts = options || {};
    doc.setFont('helvetica', opts.boldLabel ? 'bold' : 'normal');
    doc.setFontSize(opts.fontSize || 12.5);
    doc.setTextColor(82, 82, 91);
    doc.text(label + ' :', x, y);
    doc.setFont('helvetica', opts.boldValue ? 'bold' : 'normal');
    doc.setTextColor.apply(doc, opts.valueColor || palette.ink);
    doc.text(doc.splitTextToSize(text(value), maxWidth), x + labelWidth, y);
  }

  function drawCover(doc, data, detail, palette, pageWidth, pageHeight, margin) {
    if (!addBackground(doc, 'cover', pageWidth, pageHeight)) {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(229, 247, 244);
      doc.rect(0, 0, pageWidth, 102, 'F');
    }

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 103, pageWidth, pageHeight - 103, 'F');

    doc.setTextColor.apply(doc, palette.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('Regional Bestie Visit Report', margin + 2, 126);

    const storeCode = detail.siteCode4 || detail.siteCode || detail.storeCode || data.storeCode || '-';
    const address = detail.address || detail.storeAddress || data.storeAddress || '-';
    const storeHead = text(data && data.storeLeader, '-');

    const leftX = margin + 2;
    let y = 144;
    drawLabelValue(doc, 'Nama', data && data.nama, leftX, y, 31, 120, palette, { fontSize: 12.5, boldValue: true });
    y += 9;
    drawLabelValue(doc, 'Store', data && data.store, leftX, y, 31, 120, palette, { fontSize: 12.5, boldValue: true });
    y += 9;
    drawLabelValue(doc, 'Store Head', storeHead, leftX, y, 31, 120, palette, { fontSize: 11.5, boldValue: true });

    const cardX = 180;
    const cardY = 134;
    const cardW = pageWidth - cardX - margin;
    const cardH = 34;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, cardY, cardW, cardH, 3, 3, 'FD');

    const items = [
      ['Tanggal Visit', formatDate(data && data.tanggal)],
      ['Kode Store', storeCode],
      ['Area Manager', detail.areaManager || data.areaManager || '-'],
      ['Regional Manager', detail.regionalManager || data.regionalManager || '-']
    ];
    items.forEach(function (item, index) {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = cardX + 8 + col * (cardW / 2);
      const yy = cardY + 9 + row * 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.7);
      doc.setTextColor(100, 116, 139);
      doc.text(item[0].toUpperCase(), x, yy);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.2);
      doc.setTextColor.apply(doc, palette.ink);
      doc.text(doc.splitTextToSize(text(item[1]), cardW / 2 - 12).slice(0, 1), x, yy + 5);
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const addrLines = doc.splitTextToSize('Alamat: ' + text(address), pageWidth - margin * 2 - 4);
    doc.text(addrLines.slice(0, 2), margin + 2, pageHeight - 10);
  }

  async function drawQscResultSlide(doc, data, palette, pageWidth, pageHeight, margin) {
    if (data && data.showQSCResult !== true) return;
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    drawSubtlePageTitle(doc, 'QSC/ Famitrack Result', '', palette, pageWidth, margin);

    const photos = normalizeQscPhotos(data || {});
    const gap = 10;
    const cardY = 42;
    const cardW = (pageWidth - margin * 2 - gap) / 2;
    const imageH = Math.round((cardW - 6) * 3 / 4);
    const cardH = imageH + 15;

    for (let index = 0; index < 2; index += 1) {
      const photo = photos[index];
      const x = margin + index * (cardW + gap);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(x, cardY, cardW, cardH, 4, 4, 'FD');
      const added = await addImageInBox(doc, photo.image, x + 3, cardY + 3, cardW - 6, imageH, 'contain');
      if (!added) {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x + 3, cardY + 3, cardW - 6, imageH, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(148, 163, 184);
        doc.text('Belum ada foto', x + cardW / 2, cardY + 60, { align: 'center' });
      }
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const lines = doc.splitTextToSize(text(photo.description, index === 0 ? 'Foto QSC / Famitrack 1' : 'Foto QSC / Famitrack 2'), cardW - 10);
      doc.text(lines.slice(0, 2), x + 5, cardY + imageH + 8);
    }
  }

  function drawCrewSlide(doc, data, palette, pageWidth, pageHeight, margin) {
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setTextColor.apply(doc, palette.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.text('General Information', margin, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12.5);
    drawLabelValue(doc, 'Hari, Tanggal', formatDate(data && data.tanggal), margin, 42, 40, 150, palette, { fontSize: 12.5, boldValue: true });

    const crew = Array.isArray(data && data.crewList) ? data.crewList.filter(function (item) {
      return text(item && item.name, '') || text(item && item.level, '');
    }) : [];
    const rows = [
      ['Visitor', text(data && data.nama, '-'), '-'],
      ['Store Leader', text(data && data.storeLeader, '-'), text(data && data.storeLeaderLevel, '-')],
      ['Shift Leader', text(data && data.shiftLeader, '-'), text(data && data.shiftLeaderLevel, '-')]
    ];
    (crew.length ? crew : [{ name: '-', level: '-' }]).forEach(function (item, index) {
      rows.push(['Crew Store ' + String(index + 1), text(item.name, '-'), text(item.level, '-')]);
    });

    doc.autoTable({
      startY: 52,
      head: [['Role', 'Nama', 'Job Level']],
      body: rows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 12.5,
        cellPadding: 3.1,
        overflow: 'linebreak',
        valign: 'middle',
        textColor: palette.ink,
        lineColor: [203, 213, 225],
        lineWidth: 0.25,
        minCellHeight: 11
      },
      headStyles: { fillColor: palette.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 12.5, halign: 'center' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 58, fontStyle: 'bold' },
        1: { cellWidth: pageWidth - margin * 2 - 108 },
        2: { cellWidth: 50, halign: 'center' }
      },
      margin: { left: margin, right: margin, top: 32, bottom: 15 },
      tableWidth: pageWidth - margin * 2,
      showHead: 'everyPage',
      pageBreak: 'auto',
      rowPageBreak: 'auto'
    });
  }

  function drawStaticTitleSlide(doc, key, fallbackTitle, fallbackSubtitle, palette, pageWidth, pageHeight, margin) {
    doc.addPage();
    const ok = addBackground(doc, key, pageWidth, pageHeight);
    if (!ok) {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setTextColor.apply(doc, palette.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text(fallbackTitle, margin, pageHeight / 2 - 8);
      doc.setTextColor(82, 82, 91);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text(fallbackSubtitle, margin, pageHeight / 2 + 8);
    }
  }

  function calcObservationColumnStyles(doc, rows, pageWidth, margin) {
    const keys = ['temuan', 'kondisiIdeal', 'dampak', 'penyebab', 'tindakan', 'deadline', 'hasil'];
    const header = ['Temuan', 'Kondisi Ideal', 'Dampak', 'Penyebab', 'Tindakan Perbaikan', 'Tanggal Perbaikan/Deadline', 'Hasil'];
    const minWidths = [32, 34, 29, 29, 42, 30, 30];
    const maxWidths = [62, 62, 52, 52, 76, 44, 56];
    const available = pageWidth - margin * 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12.5);
    const ideal = keys.map(function (key, index) {
      let widestWord = doc.getTextWidth(header[index]);
      let totalLength = header[index].length;
      rows.forEach(function (row) {
        const value = text(row[key], '');
        totalLength += value.length;
        value.split(/\s+/).forEach(function (word) {
          if (word) widestWord = Math.max(widestWord, doc.getTextWidth(word));
        });
      });
      const contentBias = Math.sqrt(Math.max(12, totalLength / Math.max(1, rows.length))) * 1.7;
      const actionBias = index === 4 ? 8 : 0;
      return Math.min(maxWidths[index], Math.max(minWidths[index], widestWord + 8 + contentBias + actionBias));
    });
    let total = ideal.reduce(function (sum, value) { return sum + value; }, 0);
    let widths = ideal.slice();
    if (total > available) {
      const shrinkable = widths.map(function (value, index) { return Math.max(0, value - minWidths[index]); });
      const shrinkTotal = shrinkable.reduce(function (sum, value) { return sum + value; }, 0) || 1;
      const need = total - available;
      widths = widths.map(function (value, index) {
        return Math.max(minWidths[index], value - need * (shrinkable[index] / shrinkTotal));
      });
    } else if (total < available) {
      let spare = available - total;
      const growOrder = [4, 0, 1, 6, 2, 3, 5];
      growOrder.forEach(function (index) {
        if (spare <= 0) return;
        const room = Math.max(0, maxWidths[index] - widths[index]);
        const add = Math.min(room, spare * (index === 4 ? 0.5 : 0.22));
        widths[index] += add;
        spare -= add;
      });
      if (spare > 0) widths[4] += spare;
    }
    const after = widths.reduce(function (sum, value) { return sum + value; }, 0);
    if (Math.abs(after - available) > 0.5) {
      const scale = available / after;
      widths = widths.map(function (value) { return value * scale; });
    }
    return widths.reduce(function (styles, width, index) {
      styles[index] = { cellWidth: width };
      if (index === 5) styles[index].halign = 'center';
      return styles;
    }, {});
  }

  function drawObservationTable(doc, title, rows, palette, pageWidth, pageHeight, margin) {
    const cleanRows = normalizeRows(rows);
    if (!cleanRows.length) return;
    doc.addPage();
    doc.autoTable({
      startY: 30,
      head: [['Temuan', 'Kondisi Ideal', 'Dampak', 'Penyebab', 'Tindakan Perbaikan', 'Tanggal Perbaikan/ Deadline', 'Hasil']],
      body: cleanRows.map(function (row) {
        return [row.temuan || '-', row.kondisiIdeal || '-', row.dampak || '-', row.penyebab || '-', row.tindakan || '-', row.deadline ? formatDate(row.deadline) : '-', row.hasil || '-'];
      }),
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 12.5,
        cellPadding: 2.5,
        overflow: 'linebreak',
        valign: 'top',
        textColor: palette.ink,
        lineColor: [203, 213, 225],
        lineWidth: 0.25,
        minCellHeight: 11
      },
      headStyles: { fillColor: palette.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 12.5, halign: 'center', valign: 'middle' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: calcObservationColumnStyles(doc, cleanRows, pageWidth, margin),
      margin: { left: margin, right: margin, top: 30, bottom: 14 },
      tableWidth: pageWidth - margin * 2,
      showHead: 'everyPage',
      pageBreak: 'auto',
      rowPageBreak: 'auto',
      didDrawPage: function () {
        drawTopBar(doc, title, palette, pageWidth);
      }
    });
  }

  function buildPhotoGridItems(doc, photos, cardWidth, cardHeight) {
    const lineHeight = 3.65;
    const imageSize = Math.max(44, Math.min(cardWidth - 10, cardHeight - 22));
    const maxLinesWithImage = Math.max(1, Math.floor((cardHeight - imageSize - 13) / lineHeight));
    const maxLinesTextOnly = Math.max(2, Math.floor((cardHeight - 12) / lineHeight));
    const items = [];
    photos.forEach(function (photo, index) {
      const lines = doc.splitTextToSize(text(photo.description, '-'), cardWidth - 10);
      const first = lines.slice(0, maxLinesWithImage);
      items.push({ image: photo.image, lines: first, lineHeight: lineHeight, imageHeight: imageSize, imageSize: imageSize, title: 'Foto ' + String(index + 1), continuation: false });
      let rest = lines.slice(maxLinesWithImage);
      let continuationIndex = 1;
      while (rest.length) {
        const chunk = rest.slice(0, maxLinesTextOnly);
        items.push({ image: '', lines: chunk, lineHeight: lineHeight, imageHeight: 0, imageSize: 0, title: 'Lanjutan deskripsi Foto ' + String(index + 1) + '.' + String(continuationIndex), continuation: true });
        rest = rest.slice(maxLinesTextOnly);
        continuationIndex += 1;
      }
    });
    return items;
  }

  async function drawPhotoGridCard(doc, item, x, y, width, height, palette) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, y, width, height, 4, 4, 'FD');

    let descY = y + 7;
    let descHeight = height - 10;
    if (item.image) {
      const imgSize = Math.min(item.imageSize || item.imageHeight || 46, width - 8, height - 22);
      const imgX = x + (width - imgSize) / 2;
      const imgY = y + 4;
      const added = await addImageInBox(doc, item.image, imgX, imgY, imgSize, imgSize, 'coverCrop');
      if (!added) {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(imgX, imgY, imgSize, imgSize, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.8);
        doc.setTextColor(148, 163, 184);
        doc.text('No photo', x + width / 2, imgY + imgSize / 2, { align: 'center' });
      }
      descY = imgY + imgSize + 5;
      descHeight = height - (descY - y) - 4;
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x + 4, descY - 2, width - 8, Math.max(10, descHeight), 3, 3, 'F');
    if (item.continuation) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.7);
      doc.setTextColor.apply(doc, palette.primary);
      doc.text(item.title, x + 7, descY + 2.7, { baseline: 'top' });
      descY += 4.8;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.7);
    doc.setTextColor.apply(doc, palette.ink);
    doc.text(item.lines, x + 7, descY + 2.8, { baseline: 'top' });
  }

  async function drawPhotoSlides(doc, title, subtitle, templateKey, photos, palette, pageWidth, pageHeight, margin) {
    const cleanPhotos = normalizePhotos(photos);
    if (!cleanPhotos.length) return;

    drawStaticTitleSlide(doc, templateKey, title, subtitle, palette, pageWidth, pageHeight, margin);

    const columns = 3;
    const rowsPerPage = 2;
    const maxPerPage = columns * rowsPerPage;
    const gap = 5;
    const contentTop = 24;
    const contentBottom = pageHeight - 10;
    const cardWidth = (pageWidth - margin * 2 - gap * (columns - 1)) / columns;
    const cardHeight = (contentBottom - contentTop - gap * (rowsPerPage - 1)) / rowsPerPage;
    const items = buildPhotoGridItems(doc, cleanPhotos, cardWidth, cardHeight);

    function newPhotoPage() {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      drawTopBar(doc, title + ' - Evidence Photos', palette, pageWidth);
    }

    for (let index = 0; index < items.length; index += 1) {
      if (index % maxPerPage === 0) newPhotoPage();
      const slot = index % maxPerPage;
      const col = slot % columns;
      const row = Math.floor(slot / columns);
      const x = margin + col * (cardWidth + gap);
      const y = contentTop + row * (cardHeight + gap);
      await drawPhotoGridCard(doc, items[index], x, y, cardWidth, cardHeight, palette);
    }
  }

  function drawAssignmentSlide(doc, data, palette, pageWidth, pageHeight, margin) {
    drawStaticTitleSlide(doc, 'assignmentTitle', 'Store Assignment', 'Corrective Action Purpose', palette, pageWidth, pageHeight, margin);

    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor.apply(doc, palette.ink);
    doc.text('Mekanisme pelaporan', margin, 30);

    let y = 47;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor.apply(doc, palette.primary);
    doc.text(text(data && data.storeAssignmentLink, 'https://tinyurl.com/store-caassignment'), margin, y);
    y += 17;

    doc.setTextColor.apply(doc, palette.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12.5);
    const steps = [
      '1. Unduh file pada link di atas.',
      '2. Tim store mengisi form tersebut berdasarkan temuan yang telah ditunjukkan pada file laporan ini.',
      '3. Tindakan perbaikan WAJIB dilakukan sebelum deadline yang diberikan oleh Regional Bestie.',
      '4. Form tindakan perbaikan yang telah dibuat WAJIB dikirimkan kembali via email dengan terusan: Regional Manager, Area Manager, Regional Bestie, dan FMCU.'
    ];
    steps.forEach(function (step) {
      y = addWrapped(doc, step, margin, y, pageWidth - margin * 2, 7.2);
      y += 4;
    });
  }

  async function createDocument(data) {
    if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('Library jsPDF belum tersedia. Pastikan koneksi internet aktif saat membuka halaman.');
    const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: [320, 180] });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const palette = { primary: [0, 153, 166], accent: [249, 115, 22], ink: [39, 39, 42] };
    const detail = getStoreDetail(data && data.store);

    drawCover(doc, data || {}, detail, palette, pageWidth, pageHeight, margin);
    await drawQscResultSlide(doc, data || {}, palette, pageWidth, pageHeight, margin);
    drawCrewSlide(doc, data || {}, palette, pageWidth, pageHeight, margin);

    if (data && data.showOPITable === true && normalizeRows(data.opiData).length) {
      drawStaticTitleSlide(doc, 'opiTitle', 'OPI Project Observation', 'Findings & Root Cause Analysis', palette, pageWidth, pageHeight, margin);
      drawObservationTable(doc, 'OPI Project Observation', data.opiData, palette, pageWidth, pageHeight, margin);
    }
    if (data && data.showQSCTable === true && normalizeRows(data.qscData).length) {
      drawStaticTitleSlide(doc, 'qscTitle', 'QSC Observation', 'Findings & Root Cause Analysis', palette, pageWidth, pageHeight, margin);
      drawObservationTable(doc, 'QSC Observation', data.qscData, palette, pageWidth, pageHeight, margin);
    }
    if (data && data.showFindingEvidence === true) await drawPhotoSlides(doc, 'Finding Evidence', 'of OPI & QSC Observation', 'findingTitle', data.findingEvidencePhotos, palette, pageWidth, pageHeight, margin);
    if (data && data.showCorrectiveAction === true) await drawPhotoSlides(doc, 'Corrective Action Evidence & Result', 'by Regional Bestie', 'correctiveTitle', data.correctiveActionPhotos, palette, pageWidth, pageHeight, margin);
    drawAssignmentSlide(doc, data || {}, palette, pageWidth, pageHeight, margin);
    applyFooterAllPages(doc, pageWidth, pageHeight);
    return doc;
  }

  async function createBlob(data) {
    const doc = await createDocument(data);
    return doc.output('blob');
  }

  async function save(data) {
    const doc = await createDocument(data);
    doc.save(buildFileName(data));
  }

  window.ReportVisitPDF = { createDocument: createDocument, createBlob: createBlob, save: save, buildFileName: buildFileName };
})();
